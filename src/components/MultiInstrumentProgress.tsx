import ExerciseCard from './ExerciseCard';
import { useApp } from '../context/AppContext';

export default function MultiInstrumentProgress() {
  const { routine, student } = useApp();
  
  if (!routine?.exercises || routine.exercises.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-surface-400 mb-3">No routine generated yet</p>
      </div>
    );
  }
  
  // Group exercises by instrument
  const exercisesByInstrument: Record<string, any[]> = {};
  
  routine.exercises.forEach((ex: any) => {
    // Try to detect instrument from exercise data
    let instrumentName = ex.instrument || 'Practice';
    if (!instrumentName || instrumentName === 'Practice') {
      // Try to detect from title
      if (ex.title?.toLowerCase().includes('guitar')) instrumentName = 'guitar';
      else if (ex.title?.toLowerCase().includes('vocal')) instrumentName = 'vocals';
      else if (ex.title?.toLowerCase().includes('piano')) instrumentName = 'piano';
      else instrumentName = student.instruments?.[0]?.name || 'Practice';
    }
    
    if (!exercisesByInstrument[instrumentName]) {
      exercisesByInstrument[instrumentName] = [];
    }
    exercisesByInstrument[instrumentName].push(ex);
  });
  
  const instrumentNames = Object.keys(exercisesByInstrument);
  
  return (
    <div className="space-y-6">
      {instrumentNames.map(instName => {
        const instExercises = exercisesByInstrument[instName];
        const instCompleted = instExercises.filter((e: any) => e.completed).length;
        const instTotal = instExercises.length;
        const instPct = instTotal > 0 ? Math.round((instCompleted / instTotal) * 100) : 0;
        
        return (
          <div key={instName} className="bg-white rounded-xl border border-surface-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-surface-700 capitalize">{instName}</span>
                <span className="text-xs text-surface-400">{instCompleted}/{instTotal} exercises</span>
              </div>
              <span className="text-sm font-bold text-brand-600">{instPct}%</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden mb-4">
              <div className="h-full gradient-brand rounded-full transition-all duration-500" style={{ width: `${instPct}%` }} />
            </div>
            <div className="space-y-2">
              {instExercises.slice(0, 2).map((ex: any, i: number) => (
                <ExerciseCard key={ex.id} exercise={ex} index={i} onToggle={() => {}} />
              ))}
              {instExercises.length > 2 && (
                <button className="text-xs text-brand-600 mt-1 hover:underline">
                  + {instExercises.length - 2} more exercises
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
