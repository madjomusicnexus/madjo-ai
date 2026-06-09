import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { StudentProfile, PracticeRoutine } from '../types';

export type Page = 'dashboard' | 'profile' | 'instruments' | 'routine' | 'generate';

interface AppState {
  page: Page;
  student: StudentProfile;
  routine: PracticeRoutine | null;
  isGenerating: boolean;
  generateError: string | null;
  isOffline: boolean;
}

interface AppContextValue extends AppState {
  navigate: (page: Page) => void;
  generateRoutine: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  toggleExercise: (exerciseId: string) => void;
  syncProgress: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    page: 'dashboard',
    student: {
      id: '',
      name: '',
      avatar: '',
      email: '',
      instruments: [],
      dailyPracticeGoal: 30,
      streak: 0,
      joinedDate: new Date().toISOString(),
      bio: '',
      focusAreas: [],
      syllabus: 'abrsm',
      genre: 'classical',
      singingWhilePlaying: false,
    },
    routine: null,
    isGenerating: false,
    generateError: null,
    isOffline: !navigator.onLine,
  });

  const navigate = useCallback((page: Page) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const updateProfile = useCallback((updates: Partial<StudentProfile>) => {
    setState(prev => ({
      ...prev,
      student: { ...prev.student, ...updates }
    }));
  }, []);

  const toggleExercise = useCallback((exerciseId: string) => {
    setState(prev => {
      if (!prev.routine) return prev;
      const updatedExercises = prev.routine.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed, completedAt: !ex.completed ? new Date().toISOString() : null } : ex
      );
      return { ...prev, routine: { ...prev.routine, exercises: updatedExercises } };
    });
  }, []);

  const syncProgress = useCallback(async () => {
    console.log('Syncing progress...');
    return Promise.resolve();
  }, []);

  const generateRoutine = useCallback(async () => {
    if (state.isGenerating) return;
    
    setState(prev => ({ ...prev, isGenerating: true, generateError: null }));
    
    const allInstruments = state.student.instruments || [];
    const selectedInstrumentId = localStorage.getItem('selected_instrument_id');
    let selectedInstrument = allInstruments.find(i => i.id === selectedInstrumentId);
    if (!selectedInstrument && allInstruments.length > 0) {
      selectedInstrument = allInstruments.find(i => i.isPrimary) || allInstruments[0];
    }
    
    const instrument = selectedInstrument?.name || 'guitar';
    const gradeLevel = selectedInstrument?.gradeLevel || 1;
    const syllabus = selectedInstrument?.syllabus || 'abrsm';
    const genre = selectedInstrument?.genre || 'classical';
    const focusAreas = state.student.focusAreas || [];
    const singingWhilePlaying = state.student.singingWhilePlaying || false;
    
    try {
      const response = await fetch('https://hevyladjfoexdzyhtjwx.supabase.co/functions/v1/generate-routine', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          instrument, 
          gradeLevel, 
          syllabus, 
          genre, 
          focusAreas, 
          singingWhilePlaying 
        })
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      if (!data?.exercises) throw new Error('Invalid response');
      
      const routine: PracticeRoutine = {
        id: `routine-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        instrument: instrument as any,
        gradeLevel,
        focusArea: data.focusArea || `${genre} Grade ${gradeLevel} ${instrument} Practice`,
        totalDuration: data.exercises.reduce((sum: number, e: any) => sum + (e.duration || 0), 0),
        generatedBy: 'ai',
        exercises: data.exercises.map((ex: any, i: number) => ({
          id: ex.id || `ex-${i}`,
          title: ex.title,
          category: ex.category,
          duration: ex.duration,
          difficulty: ex.difficulty,
          description: ex.description,
          instructions: ex.instructions || [],
          tips: ex.tips || [],
          completed: false,
          completedAt: null
        }))
      };
      
      setState(prev => ({ ...prev, isGenerating: false, routine, page: 'routine' }));
    } catch (err) {
      console.error('Generate error:', err);
      setState(prev => ({ ...prev, isGenerating: false, generateError: err instanceof Error ? err.message : 'Failed to generate routine' }));
    }
  }, [state.isGenerating, state.student]);

  useEffect(() => {
    const saved = localStorage.getItem('madjo_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, student: { ...prev.student, ...parsed } }));
      } catch(e) { console.log('Error loading profile'); }
    }
  }, []);

  return (
    <AppContext.Provider value={{ ...state, navigate, generateRoutine, updateProfile, toggleExercise, syncProgress }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
