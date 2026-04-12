export type Goal = 'bulk' | 'cut' | 'maintain' | 'recomposition';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type TrainingStyle = 'bodybuilding' | 'powerlifting' | 'crossfit' | 'calisthenics' | 'general_fitness';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  goal?: Goal;
  activityLevel?: ActivityLevel;
  workoutFrequency?: number; // days per week
  sleepSchedule?: string;
  foodPreferences?: string[];
  dietaryRestrictions?: string[];
  injuryRestrictions?: string[];
  trainingStyle?: TrainingStyle;
  onboarded: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MealLog {
  id: string;
  userId: string;
  timestamp: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  inputSource: 'text' | 'image' | 'voice' | 'mixed' | 'preset';
  confidenceScore: number;
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  timestamp: number;
  name: string;
  category: string; // chest, back, etc.
  exercises: ExerciseLogItem[];
  duration?: number; // in minutes
  volume: number;
  intensity: number; // average RPE
}

export interface ExerciseLogItem {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  rpe?: number;
  isFailure?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  formCues: string[];
  commonMistakes: string[];
  safetyNotes: string[];
  visualUrl?: string;
}

export interface DailySummary {
  userId: string;
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinConsumed: number;
  proteinTarget: number;
  waterIntake: number; // in ml
  steps: number;
  weight: number;
  workoutCompleted: boolean;
  recoveryScore: number; // 0-100
}

export interface Alert {
  id: string;
  userId: string;
  timestamp: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
}

export interface SemanticMemoryChunk {
  id: string;
  userId: string;
  timestamp: number;
  type: 'habit' | 'preference' | 'insight' | 'trend';
  category: string;
  content: string;
  confidence: number;
}
