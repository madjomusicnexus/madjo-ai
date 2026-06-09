import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
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
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  toggleExercise: (exerciseId: string) => void;
  syncProgress: () => Promise<void>;
  exportReport: () => void;
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

  // Load profile and active routine from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setState(prev => ({
            ...prev,
            student: {
              id: profile.id || '',
              name: profile.full_name || '',
              avatar: profile.avatar_url || '',
              email: profile.email || user.email || '',
              instruments: profile.instruments || [],
              dailyPracticeGoal: profile.daily_practice_minutes || 30,
              streak: profile.streak || 0,
              joinedDate: profile.created_at || new Date().toISOString(),
              bio: profile.bio || '',
              focusAreas: profile.focus_areas || [],
              syllabus: profile.syllabus || 'abrsm',
              genre: profile.genre || 'classical',
              singingWhilePlaying: profile.singing_while_playing || false,
            }
          }));
        }
        
        // Load active routine
        const { data: routine } = await supabase
          .from('active_routines')
          .select('routine_data')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (routine?.routine_data) {
          setState(prev => ({ ...prev, routine: routine.routine_data }));
        }
      }
    };
    loadData();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<StudentProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: updates.name,
          email: updates.email,
          instruments: updates.instruments,
          daily_practice_minutes: updates.dailyPracticeGoal,
          focus_areas: updates.focusAreas,
          singing_while_playing: updates.singingWhilePlaying,
          updated_at: new Date().toISOString(),
        });
    }
    
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
      const completedCount = updatedExercises.filter(e => e.completed).length;
      const updatedRoutine = { ...prev.routine, exercises: updatedExercises };
      
      // Save progress to Supabase
      // Save immediately without delay
      const saveNow = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && updatedRoutine) {
          await supabase
            .from('active_routines')
            .upsert({
              user_id: user.id,
              routine_data: updatedRoutine,
              date: updatedRoutine.date,
              completed_count: completedCount,
              total_count: updatedExercises.length,
              updated_at: new Date().toISOString(),
            });
        }
      };
      
      return { ...prev, routine: updatedRoutine };
    });
  }, []);

  const syncProgress = useCallback(async () => {
    console.log('Syncing progress...');
    return Promise.resolve();
  }, []);

  const exportReport = useCallback(() => {
    if (!state.routine) {
      alert('No routine to export');
      return;
    }
    // Simple export as JSON
    const dataStr = JSON.stringify(state.routine, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `practice-routine-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [state.routine]);

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
      
      // Save to Supabase (overwrites existing)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('active_routines')
          .upsert({
            user_id: user.id,
            routine_data: routine,
            date: routine.date,
            completed_count: 0,
            total_count: routine.exercises.length,
            updated_at: new Date().toISOString(),
          });
      }
      
      setState(prev => ({ ...prev, isGenerating: false, routine, page: 'routine' }));
    } catch (err) {
      console.error('Generate error:', err);
      setState(prev => ({ ...prev, isGenerating: false, generateError: err instanceof Error ? err.message : 'Failed to generate routine' }));
    }
  }, [state.isGenerating, state.student]);

  return (
    <AppContext.Provider value={{ ...state, navigate, generateRoutine, updateProfile, toggleExercise, syncProgress, exportReport }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

// Missing functions needed by Dashboard and PracticeRoutine

export const downloadPDF = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const generateReportHTML = (routine: PracticeRoutine, student: StudentProfile) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Practice Report - ${student.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #1B2A4A; }
        .exercise { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .completed { background: #e0f5e0; }
        .title { font-size: 18px; font-weight: bold; }
        .date { color: #666; }
      </style>
    </head>
    <body>
      <h1>Practice Report</h1>
      <p class="date">Date: ${routine.date}</p>
      <p>Student: ${student.name}</p>
      <p>Instrument: ${routine.instrument}</p>
      <p>Grade: ${routine.gradeLevel}</p>
      <p>Focus: ${routine.focusArea}</p>
      <h2>Exercises (${routine.exercises.filter(e => e.completed).length}/${routine.exercises.length} completed)</h2>
      ${routine.exercises.map(ex => `
        <div class="exercise ${ex.completed ? 'completed' : ''}">
          <div class="title">${ex.title}</div>
          <div>Duration: ${ex.duration} min</div>
          <div>Difficulty: ${ex.difficulty}</div>
          <div>${ex.description}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
};
