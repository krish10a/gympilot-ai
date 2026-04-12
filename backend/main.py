import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from google import genai

from database import engine, Base, get_db
import models, schemas, agents, memory

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GymPilot AI", version="1.0.0")

# Allow origins from the FRONTEND_URL env var (comma-separated for multi-origin support)
frontend_urls = os.getenv("FRONTEND_URL", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def get_embedding(text: str) -> list[float]:
    """Generate a 768-dim embedding via Gemini. Falls back to zeros if unavailable."""
    if not gemini_client:
        return [0.0] * 768
    try:
        response = gemini_client.models.embed_content(
            model='gemini-embedding-2-preview',
            contents=text,
            config={'output_dimensionality': 768}
        )
        if hasattr(response, 'embeddings') and response.embeddings:
            return response.embeddings[0].values
        elif isinstance(response, dict) and 'embeddings' in response:
            return response['embeddings'][0]['values']
        return [0.0] * 768
    except Exception as e:
        print(f"Embedding error: {e}")
        return [0.0] * 768


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "GymPilot AI backend is operational."}


@app.post("/api/users", response_model=schemas.UserOut)
def sync_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Upsert a Firebase-authenticated user into Postgres and sync their profile."""
    user = db.query(models.User).filter(models.User.uid == user_in.uid).first()
    if not user:
        user = models.User(
            uid=user_in.uid,
            email=user_in.email,
            display_name=user_in.display_name,
            photo_url=user_in.photo_url,
            onboarded=user_in.onboarded
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if user_in.profile:
        profile = db.query(models.Profile).filter(models.Profile.user_id == user.uid).first()
        if not profile:
            profile = models.Profile(**user_in.profile.model_dump(), user_id=user.uid)
            db.add(profile)
        else:
            for k, v in user_in.profile.model_dump().items():
                setattr(profile, k, v)
        user.onboarded = True
        db.commit()

    return user


@app.get("/api/users/{uid}", response_model=schemas.UserOut)
def get_user(uid: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/agent/fuse")
def run_input_fusion(input_data: schemas.MultimodalInput, db: Session = Depends(get_db)):
    """Route multimodal input (text, voice, image) through the Fusion Agent and return structured nutrition/workout data."""
    return agents.input_fusion_agent(
        text_input=input_data.text_input,
        voice_input=input_data.voice_input,
        mime_type=input_data.mime_type,
        image_b64=input_data.image_base64
    )


@app.post("/api/logs/meal", response_model=schemas.MealLogOut)
def create_meal_log(log_in: schemas.MealLogCreate, db: Session = Depends(get_db)):
    """Persist a meal log and store a semantic memory chunk in Pinecone."""
    meal = models.MealLog(
        id=log_in.id,
        user_id=log_in.user_id,
        items=[item.model_dump() for item in log_in.items] if log_in.items else [],
        total_calories=log_in.total_calories,
        total_protein=log_in.total_protein,
        total_carbs=log_in.total_carbs,
        total_fat=log_in.total_fat,
        source=log_in.source,
        confidence_score=log_in.confidence_score
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)

    items_desc = ", ".join([i.name for i in log_in.items]) if log_in.items else "a meal"
    text_desc = f"Logged a meal containing {items_desc} with {log_in.total_calories} calories and {log_in.total_protein}g protein."
    emb = get_embedding(text_desc)
    memory.store_memory_chunk(log_in.user_id, f"meal_{meal.id}", list(emb), text_desc)

    return meal


@app.post("/api/logs/workout", response_model=schemas.WorkoutLogOut)
def create_workout_log(log_in: schemas.WorkoutLogCreate, db: Session = Depends(get_db)):
    """Persist a workout log and store a semantic memory chunk in Pinecone."""
    workout = models.WorkoutLog(
        id=log_in.id,
        user_id=log_in.user_id,
        title=log_in.title,
        duration_min=log_in.duration_min,
        exercises=[ex.model_dump() for ex in log_in.exercises] if log_in.exercises else [],
        total_volume=log_in.total_volume,
        source=log_in.source
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)

    ex_desc = ", ".join([e.name for e in log_in.exercises]) if log_in.exercises else "a workout session"
    text_desc = f"Completed workout '{log_in.title}' ({log_in.duration_min} min). Exercises: {ex_desc}."
    emb = get_embedding(text_desc)
    memory.store_memory_chunk(log_in.user_id, f"workout_{workout.id}", list(emb), text_desc)

    return workout


@app.get("/api/coach/insight")
def get_coach_insight(user_id: str, db: Session = Depends(get_db)):
    """Fetch recent user context from Pinecone and generate a personalised coach insight via Gemini."""
    user = get_user(user_id, db)
    daily_summary = (
        db.query(models.DailySummary)
        .filter(models.DailySummary.user_id == user_id)
        .order_by(models.DailySummary.date.desc())
        .first()
    )
    summary_dict = daily_summary.__dict__ if daily_summary else {}

    emb = get_embedding("What is the recent pattern of workouts and meals for this user?")
    memories = memory.query_pinecone_context(user_id, list(emb), top_k=3)

    profile_dict = {}
    if user.profile:
        profile_dict = {k: v for k, v in user.profile.__dict__.items() if not k.startswith('_')}

    insight = agents.coach_agent(
        profile_dict=profile_dict,
        summary_dict=summary_dict,
        pinecone_memory_chunks=memories
    )

    return {"status": "success", "insight_text": insight, "alerts": []}


@app.get("/")
def read_root():
    return {"message": "GymPilot AI backend is live."}
