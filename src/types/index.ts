export type Instrument = 'piano' | 'guitar' | 'violin' | 'drums' | 'vocals' | 'bass' | 'flute' | 'saxophone' | 'cello' | 'trumpet';

export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type PracticeCategory = 'warmup' | 'technique' | 'sight-reading' | 'repertoire' | 'ear-training' | 'theory' | 'cool-down';

export type Syllabus = 
  | 'abrsm' 
  | 'trinity' 
  | 'rockschool' 
  | 'trinity-rock-pop' 
  | 'berklee' 
  | 'jazz' 
  | 'blues' 
  | 'custom';

export type Genre = 
  | 'classical' 
  | 'rock' 
  | 'pop' 
  | 'jazz' 
  | 'blues' 
  | 'metal' 
  | 'folk' 
  | 'r_and_b' 
  | 'funk';

// NEW: Student Instrument with individual settings
export interface StudentInstrument {
  id: string;
  name: Instrument;
  isPrimary: boolean;
  gradeLevel: GradeLevel;
  syllabus: Syllabus;
  genre: Genre;
  xp: number;
  level: number;
}

// UPDATED: StudentProfile with multi-instrument support and email
export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  email?: string;  // NEW: Email for practice reports
  instruments: StudentInstrument[];  // Replaces single 'instrument'
  dailyPracticeGoal: number;
  streak: number;
  joinedDate: string;
  bio: string;
  focusAreas: string[];
  syllabus: Syllabus;  // Kept for backward compatibility
  genre: Genre;        // Kept for backward compatibility
  singingWhilePlaying: boolean;  // NEW: Special coordination mode
}

// For backward compatibility - get primary instrument
export function getPrimaryInstrument(profile: StudentProfile): StudentInstrument | undefined {
  return profile.instruments.find(i => i.isPrimary);
}

// For backward compatibility - get instrument names list
export function getInstrumentNames(profile: StudentProfile): string[] {
  return profile.instruments.map(i => i.name);
}

// Level Group Functions
export type LevelGroup = 'foundation' | 'intermediate' | 'advanced';

export function getLevelGroup(gradeLevel: GradeLevel): LevelGroup {
  if (gradeLevel <= 2) return 'foundation';
  if (gradeLevel <= 5) return 'intermediate';
  return 'advanced';
}

export function getLevelGroupName(levelGroup: LevelGroup): string {
  switch(levelGroup) {
    case 'foundation': return 'Foundation (Grades 1-2)';
    case 'intermediate': return 'Intermediate (Grades 3-5)';
    case 'advanced': return 'Advanced (Grades 6-8)';
  }
}

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  category: PracticeCategory;
  duration: number;
  difficulty: DifficultyLevel;
  instructions: string[];
  tips: string[];
  completed: boolean;
  instrumentId?: string; // Optional: which instrument this exercise is for
}

export interface PracticeRoutine {
  id: string;
  date: string;
  instrument: Instrument;  // Primary instrument for this routine
  gradeLevel: GradeLevel;
  totalDuration: number;
  exercises: PracticeExercise[];
  generatedBy: 'gemini-ai' | 'ai';
  focusArea: string;
  isSingingWhilePlaying?: boolean;  // NEW: Indicates if this is a coordination routine
}

export interface ProgressStats {
  totalPracticeMinutes: number;
  weeklyGoalProgress: number;
  exercisesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  gradeProgress: number;
}

export interface WeeklyData {
  day: string;
  minutes: number;
  completed: number;
}

export interface InstrumentOption {
  id: Instrument;
  name: string;
  description: string;
}