from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class User(Base):
    __tablename__ = "users"

    uid = Column(String, primary_key=True, index=True) # Firebase UID
    email = Column(String, unique=True, index=True)
    display_name = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    profile = relationship("Profile", back_populates="user", uselist=False)
    meals = relationship("MealLog", back_populates="user")
    workouts = relationship("WorkoutLog", back_populates="user")
    daily_summaries = relationship("DailySummary", back_populates="user")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.uid"))
    age = Column(Integer)
    sex = Column(String)
    height = Column(Float)
    weight = Column(Float)
    goal = Column(String)
    activity_level = Column(String)
    training_style = Column(String)
    
    user = relationship("User", back_populates="profile")

class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(String, primary_key=True, index=True) # UUID or generated id
    user_id = Column(String, ForeignKey("users.uid"))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Store the highly structured item data as JSON
    items = Column(JSON, nullable=False) # e.g. [{"name": "Rice", "qty": 100, ...}]
    
    total_calories = Column(Float, default=0.0)
    total_protein = Column(Float, default=0.0)
    total_carbs = Column(Float, default=0.0)
    total_fat = Column(Float, default=0.0)
    
    source = Column(String) # 'image', 'text', 'voice', 'mixed'
    confidence_score = Column(Float, nullable=True)
    
    user = relationship("User", back_populates="meals")

class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.uid"))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    title = Column(String)
    duration_min = Column(Integer)
    
    # Structured exercise list
    exercises = Column(JSON, nullable=False) # e.g. [{"name": "Squat", "sets": [{"reps": 5, "weight": 100}]}]
    
    total_volume = Column(Float, default=0.0)
    source = Column(String)
    
    user = relationship("User", back_populates="workouts")

class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.uid"))
    date = Column(String, index=True) # YYYY-MM-DD
    
    total_calories = Column(Float, default=0.0)
    total_protein = Column(Float, default=0.0)
    total_water_ml = Column(Float, default=0.0)
    total_steps = Column(Integer, default=0)
    
    workout_logged = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="daily_summaries")
