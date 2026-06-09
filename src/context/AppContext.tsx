import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { markPracticeCompleted } from '../lib/streakTracker';
import { addXP, calculateExerciseXP, getStreakBonusXP, getXPData } from '../lib/xpSystem';
import { saveDailyProgress } from '../lib/progressTracker';
import { cacheRoutine, markOfflineComplete, syncOfflineProgress, isOnline } from '../lib/offlineSync';
import { supabase, loadProfileFromSupabase, saveProfileToSupabase } from '../lib/supabase';
import { generatePracticeReportHTML, type PracticeReportData } from '../lib/emailReport';
import type { StudentProfile, Instrument, GradeLevel, PracticeRoutine, PracticeExercise, StudentInstrument } from '../types';
import { getPrimaryInstrument } from '../types';

export type Page = 'dashboard' | 'profile' | 'instruments' | 'routine' | 'generate' | 'teacher';

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
  setInstrument: (instrument: Instrument) => void;
  setGradeLevel: (grade: GradeLevel) => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  generateRoutine: () => void;
  toggleExercise: (exerciseId: string) => void;
  syncProgress: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const mockStudent: StudentProfile = {
  name: 'Music Student',
  email: '',
  instruments: [],
  dailyPracticeGoal: 30,
  focusAreas: [],
  singingWhilePlaying: false,
  id: '',
  avatar: '',
  streak: 0,
  joinedDate: '',
  bio: '',
  syllabus: 'jazz',
  genre: 'classical'
};

function loadSavedProfile(): StudentProfile {
  const saved = localStorage.getItem('student_profile');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      console.log('Loaded profile from localStorage:', parsed);
      return parsed;
    } catch (e) {
      console.log('Failed to parse saved profile');
    }
  }
  return { 
    ...mockStudent, 
    syllabus: 'abrsm', 
    genre: 'classical', 
    focusAreas: [],
    instruments: [],
    singingWhilePlaying: false,
    email: ''
  };
}

function saveProfileToLocalStorage(profile: StudentProfile) {
  console.log('Saving profile to localStorage:', profile);
  localStorage.setItem('student_profile', JSON.stringify(profile));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    page: 'dashboard',
    student: loadSavedProfile(),
    routine: null,
    isGenerating: false,
    generateError: null,
    isOffline: !navigator.onLine,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('Auth check - user:', user?.id || 'No user');
      
      if (user) {
        const supabaseProfile = await loadProfileFromSupabase();
        if (supabaseProfile) {
          console.log('Found profile in Supabase:', supabaseProfile);
          
          let instruments: StudentInstrument[] = [];
          if (supabaseProfile.instruments) {
            try {
              instruments = typeof supabaseProfile.instruments === 'string' 
                ? JSON.parse(supabaseProfile.instruments) 
                : supabaseProfile.instruments;
              console.log('Parsed instruments:', instruments);
            } catch (e) {
              console.log('Failed to parse instruments:', e);
            }
          }
          
          const profile: StudentProfile = {
            id: supabaseProfile.id,
            name: supabaseProfile.full_name || mockStudent.name,
            avatar: supabaseProfile.avatar_url || '👤',
            email: supabaseProfile.email || '',
            instruments: instruments,
            dailyPracticeGoal: supabaseProfile.daily_practice_minutes || mockStudent.dailyPracticeGoal,
            streak: supabaseProfile.streak || 0,
            joinedDate: supabaseProfile.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            bio: supabaseProfile.bio || '',
            focusAreas: supabaseProfile.focus_areas || [],
            syllabus: supabaseProfile.syllabus || 'abrsm',
            genre: supabaseProfile.genre || 'classical',
            singingWhilePlaying: supabaseProfile.singing_while_playing || false,
          };
          setState(s => ({ ...s, student: profile }));
          saveProfileToLocalStorage(profile);

      // Load active routine from Supabase
      const { data: routineData } = await supabase
        .from('active_routines')
        .select('routine_data')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (routineData?.routine_data) {
        console.log("📋 Loaded routine from Supabase");
        setState(prev => ({ ...prev, routine: routineData.routine_data }));
      }
        }
      }
      setIsLoading(false);
    };
    
    loadProfile();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const supabaseProfile = await loadProfileFromSupabase();
        if (supabaseProfile) {
          let instruments: StudentInstrument[] = [];
          if (supabaseProfile.instruments) {
            try {
              instruments = typeof supabaseProfile.instruments === 'string' 
                ? JSON.parse(supabaseProfile.instruments) 
                : supabaseProfile.instruments;
            } catch (e) {
              console.log('Failed to parse instruments');
            }
          }
          
          const profile: StudentProfile = {
            id: supabaseProfile.id,
            name: supabaseProfile.full_name || mockStudent.name,
            avatar: supabaseProfile.avatar_url || '👤',
            email: supabaseProfile.email || '',
            instruments: instruments,
            dailyPracticeGoal: supabaseProfile.daily_practice_minutes || mockStudent.dailyPracticeGoal,
            streak: supabaseProfile.streak || 0,
            joinedDate: supabaseProfile.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            bio: supabaseProfile.bio || '',
            focusAreas: supabaseProfile.focus_areas || [],
            syllabus: supabaseProfile.syllabus || 'abrsm',
            genre: supabaseProfile.genre || 'classical',
            singingWhilePlaying: supabaseProfile.singing_while_playing || false,
          };
          setState(s => ({ ...s, student: profile }));
          saveProfileToLocalStorage(profile);

      // Load active routine from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const { data: routineData } = await supabase
        .from('active_routines')
        .select('routine_data')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (routineData?.routine_data) {
        console.log("📋 Loaded routine from Supabase");
        setState(prev => ({ ...prev, routine: routineData.routine_data }));
      }
        }
      } else if (event === 'SIGNED_OUT') {
        setState(s => ({ ...s, student: { ...mockStudent, syllabus: 'abrsm', genre: 'classical', focusAreas: [], instruments: [], singingWhilePlaying: false, email: '' } }));
        localStorage.removeItem('student_profile');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setState(s => ({ ...s, isOffline: false }));
    const handleOffline = () => setState(s => ({ ...s, isOffline: true }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navigate = useCallback((page: Page) => {
    setState((s) => ({ ...s, page }));
  }, []);

  const setInstrument = useCallback((_instrument: Instrument) => {
    setState((s) => {
      const updatedStudent = { ...s.student };
      saveProfileToLocalStorage(updatedStudent);
      saveProfileToSupabase(updatedStudent);
      return { ...s, student: updatedStudent };
    });
  }, []);

  const setGradeLevel = useCallback((_gradeLevel: GradeLevel) => {
    setState((s) => {
      const updatedStudent = { ...s.student };
      saveProfileToLocalStorage(updatedStudent);
      saveProfileToSupabase(updatedStudent);
      return { ...s, student: updatedStudent };
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<StudentProfile>) => {
    console.log('🔄 updateProfile called with:', updates);
    
    setState((s) => {
      const updatedStudent = { 
        ...s.student, 
        ...updates,
        instruments: updates.instruments || s.student.instruments || []
      };
      
      console.log('🔄 Updated student instruments:', updatedStudent.instruments);
      
      saveProfileToLocalStorage(updatedStudent);
      saveProfileToSupabase(updatedStudent);
      
      return { ...s, student: updatedStudent };
    });
  }, []);

  const syncProgress = useCallback(async () => {
    if (isOnline()) {
      const syncedCount = await syncOfflineProgress();
      if (syncedCount > 0) {
        alert(`✅ Synced ${syncedCount} offline practice sessions!`);
      }
    }
  }, []);

  // FIXED: toggleExercise now saves progress to Supabase on every toggle WITH DEBUG LOGS
  const toggleExercise = useCallback((exerciseId: string) => {
    console.log("🔘 1. toggleExercise called with ID:", exerciseId);
    
    setState((s) => {
      console.log("🔘 2. setState running, current routine:", s.routine?.id);
      
      if (!s.routine) {
        console.log("🔘 3. No routine found, returning");
        return s;
      }
      
      const newExercises = s.routine.exercises.map((ex: PracticeExercise) =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      );
      
      console.log("🔘 4. New exercises created. Completed count:", newExercises.filter(e => e.completed).length);
      
      // Save individual exercise progress to Supabase (every time, not just on completion)
      const saveExerciseProgress = async () => {
        console.log("🔘 5. saveExerciseProgress starting...");
        const { data: { user } } = await supabase.auth.getUser();
        console.log("🔘 6. Current user:", user?.email || "No user");
        
        if (user && s.routine) {
          const updatedRoutine = { ...s.routine, exercises: newExercises };
          const completedCount = newExercises.filter(e => e.completed).length;
          
          console.log("🔘 7. Attempting to save to Supabase...");
          const { error } = await supabase
            .from('active_routines')
            .upsert({
              user_id: user.id,
              routine_data: updatedRoutine,
              date: updatedRoutine.date,
              completed_count: completedCount,
              total_count: newExercises.length,
              updated_at: new Date().toISOString(),
            });
          
          if (error) {
            console.error('❌ Failed to save progress to Supabase:', error);
          } else {
            console.log('✅ Progress saved to Supabase!');
          }
        } else {
          console.log("🔘 8. No user or no routine - skipping save");
        }
      };
      saveExerciseProgress();
      
      const allCompleted = newExercises.every((ex) => ex.completed === true);
      console.log("🔘 9. All exercises completed?", allCompleted);
      
      if (allCompleted) {
        console.log("🔘 10. ALL COMPLETED! Running completion logic...");
        if (s.isOffline) {
          markOfflineComplete(s.routine!.id, exerciseId);
        } else {
          markPracticeCompleted();
          
          const exercisesDone = newExercises.filter(ex => ex.completed).length;
          const xpEarned = calculateExerciseXP(exercisesDone);
          const { leveledUp, newLevel } = addXP(xpEarned, `Completed ${exercisesDone} exercises`);
          
          saveDailyProgress(exercisesDone, xpEarned);
          
          const streakHistory = localStorage.getItem('practice_history');
          const streaks = streakHistory ? JSON.parse(streakHistory) : [];
          const streakBonus = getStreakBonusXP(streaks.length);
          if (streakBonus > 0) {
            addXP(streakBonus, `🔥 ${streaks.length} day streak bonus!`);
          }
          
          if (leveledUp) {
            const levels = ['', 'Beginner', 'Rookie', 'Rising Star', 'Performer', 'Rocker', 'Virtuoso', 'Maestro', 'Legend', 'Icon', 'Grand Master'];
            localStorage.setItem('just_leveled_up', levels[newLevel] || `Level ${newLevel}`);
          }

          // Send email report (async, non-blocking)
          if (s.student.email && s.student.email.trim() !== '') {
            setTimeout(() => {
              (async () => {
                try {
                  const xpData = getXPData();
                  const completedExercises = newExercises.filter(ex => ex.completed);
                  const exercisesByInstrument: Record<string, any[]> = {};
                  
                  completedExercises.forEach(ex => {
                    const match = ex.title.match(/^\[([A-Z]+)\]/);
                    let instrumentName = match ? match[1].toLowerCase() : 'music';
                    if (!exercisesByInstrument[instrumentName]) {
                      exercisesByInstrument[instrumentName] = [];
                    }
                    exercisesByInstrument[instrumentName].push(ex);
                  });
                  
                  const instrumentsData = Object.entries(exercisesByInstrument).map(([name, exercises]) => ({
                    name,
                    exercises: exercises.map((ex: any) => ({
                      title: ex.title.replace(/^\[[A-Z]+\]\s*/, ''),
                      description: ex.description,
                      category: ex.category,
                      duration: ex.duration,
                    }))
                  }));
                  
                  const reportData: PracticeReportData = {
                    studentName: s.student.name,
                    studentEmail: s.student.email ?? '',
                    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    instruments: instrumentsData,
                    totalDuration: completedExercises.reduce((sum, ex) => sum + ex.duration, 0),
                    totalExercises: completedExercises.length,
                    xpEarned: xpEarned,
                    streakDays: streaks.length + (streakBonus > 0 ? 1 : 0),
                    level: xpData.level,
                    levelTitle: xpData.title,
                    xpToNextLevel: xpData.xpToNextLevel,
                    singingWhilePlaying: s.student.singingWhilePlaying || false,
                  };
                  
                  const emailHtml = generatePracticeReportHTML(reportData);
                  
                  const { error: emailError } = await supabase.functions.invoke('send-email', {
                    body: {
                      to: s.student.email,
                      subject: `🎵 MadJo AI Practice Report - ${new Date().toLocaleDateString()}`,
                      html: emailHtml,
                    },
                  });
                  
                  if (emailError) {
                    console.error('Failed to send email:', emailError);
                  } else {
                    console.log('✅ Practice report email sent to', s.student.email);
                  }
                } catch (emailErr) {
                  console.error('Email sending error:', emailErr);
                }
              })();
            }, 100);
          }
        }
      }
      
      console.log("🔘 11. Returning updated state");
      return { ...s, routine: { ...s.routine, exercises: newExercises } };
    });
  }, []);

  const generateRoutine = useCallback(async () => {
    setState((s) => ({ ...s, isGenerating: true, generateError: null }));

    try {
      const selectedInstrumentId = localStorage.getItem('selected_instrument_id');
      const includeAllInstruments = localStorage.getItem('include_all_instruments') === 'true';
      
      let primaryInstrument: StudentInstrument | undefined;
      let allInstruments: StudentInstrument[] = [];
      
      if (includeAllInstruments && state.student.instruments?.length > 0) {
        allInstruments = state.student.instruments;
        primaryInstrument = allInstruments.find(i => i.isPrimary) || allInstruments[0];
      } else if (selectedInstrumentId) {
        primaryInstrument = state.student.instruments?.find(i => i.id === selectedInstrumentId);
        allInstruments = primaryInstrument ? [primaryInstrument] : [];
      } else {
        primaryInstrument = getPrimaryInstrument(state.student);
        allInstruments = primaryInstrument ? [primaryInstrument] : [];
      }
      
      if (!primaryInstrument) {
        throw new Error('No instrument selected. Please add an instrument in your profile.');
      }
      
      const instrument = primaryInstrument.name;
      const gradeLevel = primaryInstrument.gradeLevel;
      const syllabus = primaryInstrument.syllabus;
      const genre = primaryInstrument.genre;
      const { dailyPracticeGoal, focusAreas, singingWhilePlaying } = state.student;
      
      const timePerInstrument = includeAllInstruments && allInstruments.length > 1
        ? Math.floor(dailyPracticeGoal / allInstruments.length)
        : dailyPracticeGoal;

      if (state.isOffline) {
        const cached = localStorage.getItem('last_routine');
        if (cached) {
          const lastRoutine = JSON.parse(cached);
          setState((s) => ({
            ...s,
            isGenerating: false,
            routine: lastRoutine,
            page: 'routine' as Page,
          }));
          return;
        } else {
          throw new Error('Offline: No cached routine available');
        }
      }

      const response = await fetch("https://hevyladjfoexdzyhtjwx.supabase.co/functions/v1/generate-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldnlsYWRqZm9leGR6eWh0and4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDUzMzgsImV4cCI6MjA5NTM4MTMzOH0.kG3Ra4vPbOmwbgfqgK353SaSyQDBrk-DU9OWtKNMioA` },
        body: JSON.stringify({ instrument, gradeLevel, syllabus, genre, focusAreas, singingWhilePlaying, timePerInstrument })
      });
      const data = await response.json();
      const error = data.error ? { message: data.error } : null;
      if (error) {
        throw new Error(error.message || 'Failed to call edge function');
      }

      if (!data || !data.exercises || !Array.isArray(data.exercises)) {
        throw new Error('Invalid response from AI — missing exercises');
      }

      let focusAreaText = data.focusArea || `${genre || 'Classical'} Grade ${gradeLevel} ${instrument} Practice`;
      if (includeAllInstruments && allInstruments.length > 1) {
        const instrumentList = allInstruments.map(i => i.name).join(' + ');
        focusAreaText = `Multi-Instrument Practice: ${instrumentList} (${timePerInstrument} min each) - ${focusAreaText}`;
      }

      const routine: PracticeRoutine = {
        id: `routine-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        instrument: instrument as Instrument,
        gradeLevel,
        focusArea: focusAreaText,
        totalDuration: data.exercises.reduce((sum: number, e: PracticeExercise) => sum + (e.duration || 0), 0),
        generatedBy: 'ai',
        exercises: data.exercises.map((ex: Record<string, unknown>, i: number) => ({
          id: ex.id || `ex-${i + 1}`,
          title: ex.title || `Exercise ${i + 1}`,
          description: ex.description || '',
          category: ex.category || 'technique',
          duration: Number(ex.duration) || 5,
          difficulty: ex.difficulty || 'intermediate',
          instructions: Array.isArray(ex.instructions) ? ex.instructions : [],
          tips: Array.isArray(ex.tips) ? ex.tips : [],
          completed: false,
        })),
        isSingingWhilePlaying: singingWhilePlaying || false,
      };

      localStorage.setItem('last_routine', JSON.stringify(routine));
      cacheRoutine(routine);

      setState((s) => ({
        ...s,
        isGenerating: false,
        routine,
        page: 'routine' as Page,
      }));

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate routine';
      console.error('Generate routine error:', err);
      setState((s) => ({ ...s, isGenerating: false, generateError: message }));
    }
  }, [state.student, state.isOffline]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-surface-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{ ...state, navigate, setInstrument, setGradeLevel, updateProfile, generateRoutine, toggleExercise, syncProgress }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}