import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { StudentProfile, PracticeRoutine, Page, Instrument, StudentInstrument } from '../types';

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
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    page: 'dashboard',
    student: {
      name: '',
      email: '',
      instruments: [],
      dailyPracticeGoal: 30,
      focusAreas: [],
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

  const generateRoutine = useCallback(async () => {
    if (state.isGenerating) return;
    
    setState(prev => ({ ...prev, isGenerating: true, generateError: null }));
    
    const includeAllInstruments = localStorage.getItem('include_all_instruments') === 'true';
    const allInstruments = state.student.instruments || [];
    
    // Get selected instrument from localStorage
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
    const timePerInstrument = Math.floor((state.student.dailyPracticeGoal || 30) / (includeAllInstruments ? allInstruments.length : 1));
    
    try {
      const response = await fetch('https://hevyladjfoexdzyhtjwx.supabase.co/functions/v1/generate-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldnlsYWRqZm9leGR6eWh0and4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDUzMzgsImV4cCI6MjA5NTM4MTMzOH0.kG3Ra4vPbOmwbgfqgK353SaSyQDBrk-DU9OWtKNMioA'
        },
        body: JSON.stringify({
          instrument,
          gradeLevel,
          dailyPracticeGoal: timePerInstrument,
          syllabus,
          genre,
          focusAreas,
          singingWhilePlaying,
          hasMultipleInstruments: allInstruments.length > 1,
          includeAllInstruments,
          allInstruments: allInstruments.map(i => ({
            name: i.name,
            gradeLevel: i.gradeLevel,
            syllabus: i.syllabus,
            genre: i.genre,
            isPrimary: i.isPrimary
          })),
        })
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      if (!data?.exercises) throw new Error('Invalid response');
      
      const routine: PracticeRoutine = {
        id: `routine-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        instrument: instrument as Instrument,
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
          instructions: ex.instructions,
          tips: ex.tips,
          completed: false,
          completedAt: null
        }))
      };
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        routine,
        page: 'routine'
      }));
      
    } catch (err) {
      console.error('Generate routine error:', err);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generateError: err instanceof Error ? err.message : 'Failed to generate routine'
      }));
    }
  }, [state.isGenerating, state.student]);

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadProfile = async () => {
      const saved = localStorage.getItem('madjo_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState(prev => ({
            ...prev,
            student: { ...prev.student, ...parsed }
          }));
        } catch(e) { console.log('Error loading profile'); }
      }
    };
    loadProfile();
  }, []);

  return (
    <AppContext.Provider value={{ ...state, navigate, generateRoutine, updateProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
