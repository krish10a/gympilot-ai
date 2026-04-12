import { Exercise } from '../types';

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    formCues: [
      'Keep your feet flat on the floor',
      'Retract your shoulder blades',
      'Lower the bar to mid-chest',
      'Drive the bar up while keeping your elbows tucked'
    ],
    commonMistakes: [
      'Bouncing the bar off the chest',
      'Lifting feet off the floor',
      'Flaring elbows too wide'
    ],
    safetyNotes: [
      'Use a spotter for heavy sets',
      'Ensure the bar is balanced'
    ],
    visualUrl: 'https://picsum.photos/seed/benchpress/400/300'
  },
  {
    id: 'squat',
    name: 'Barbell Squat',
    muscleGroups: ['Quads', 'Glutes', 'Hamstrings', 'Lower Back'],
    formCues: [
      'Place the bar on your upper traps',
      'Keep your chest up and core tight',
      'Sit back and down until thighs are parallel to floor',
      'Drive through your heels to stand up'
    ],
    commonMistakes: [
      'Knees caving inward',
      'Rounding the lower back',
      'Not going deep enough'
    ],
    safetyNotes: [
      'Use a squat rack with safety bars',
      'Keep your spine neutral'
    ],
    visualUrl: 'https://picsum.photos/seed/squat/400/300'
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroups: ['Lower Back', 'Hamstrings', 'Glutes', 'Traps'],
    formCues: [
      'Stand with feet hip-width apart',
      'Grip the bar just outside your legs',
      'Keep your back flat and chest up',
      'Pull the bar up close to your shins'
    ],
    commonMistakes: [
      'Rounding the back during the lift',
      'Jerking the bar off the floor',
      'Hyperextending at the top'
    ],
    safetyNotes: [
      'Do not round your lower back',
      'Start with light weight to master form'
    ],
    visualUrl: 'https://picsum.photos/seed/deadlift/400/300'
  }
];
