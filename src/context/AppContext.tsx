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
    console.log('Toggle exercise:', exerciseId);
  }, []);

  const syncProgress = useCallback(async () => {
    console.log('Syncing progress...');
    return Promise.resolve();
  }, []);

  const generateRoutine = useCallback(async () => {
    console.log('Generate routine called');
  }, []);

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
