from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class ProfileBase(BaseModel):
    age: int
    sex: str
    height: float
    weight: float
    goal: str
    activity_level: str
    training_style: str

class UserCreate(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    onboarded: bool = False
    profile: Optional[ProfileBase] = None

class UserOut(BaseModel):
    uid: str
    email: str
    onboarded: bool
    profile: Optional[ProfileBase] = None
    model_config = ConfigDict(from_attributes=True)

class MealItemSchema(BaseModel):
    name: str
    quantity: str
    calories: float
    protein: float
    carbs: float
    fat: float

class MealLogCreate(BaseModel):
    id: str
    user_id: str
    items: List[MealItemSchema]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    source: str
    confidence_score: Optional[float] = None

class MealLogOut(MealLogCreate):
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class ExerciseSetSchema(BaseModel):
    reps: int
    weight: float

class ExerciseSchema(BaseModel):
    name: str
    sets: List[ExerciseSetSchema]

class WorkoutLogCreate(BaseModel):
    id: str
    user_id: str
    title: str
    duration_min: int
    exercises: List[ExerciseSchema]
    total_volume: float
    source: str

class WorkoutLogOut(WorkoutLogCreate):
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class DailySummaryBase(BaseModel):
    date: str
    total_calories: float = 0.0
    total_protein: float = 0.0
    total_water_ml: float = 0.0
    total_steps: int = 0
    workout_logged: bool = False

class MultimodalInput(BaseModel):
    user_id: str
    text_input: Optional[str] = None
    voice_input: Optional[str] = None
    image_base64: Optional[str] = None
    mime_type: Optional[str] = None
