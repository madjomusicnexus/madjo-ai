import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import type { PracticeExercise } from '../types';

interface ExerciseCardProps {
  exercise: PracticeExercise;
  index: number;
  onToggle: (id: string) => void;
}

const categoryConfig: Record<string, { label: string; gradient: string; icon: string }> = {
  warmup: { label: 'Warm Up', gradient: 'from-amber-500 to-amber-600', icon: 'text-amber-600' },
  technique: { label: 'Technique', gradient: 'from-brand-500 to-brand-600', icon: 'text-brand-600' },
  'sight-reading': { label: 'Sight Reading', gradient: 'from-sky-500 to-sky-600', icon: 'text-sky-600' },
  repertoire: { label: 'Repertoire', gradient: 'from-rose-500 to-rose-600', icon: 'text-rose-600' },
  'ear-training': { label: 'Ear Training', gradient: 'from-teal-500 to-teal-600', icon: 'text-teal-600' },
  theory: { label: 'Theory', gradient: 'from-slate-500 to-slate-600', icon: 'text-slate-600' },
  'cool-down': { label: 'Cool Down', gradient: 'from-surface-400 to-surface-500', icon: 'text-surface-500' },
};

const diffConfig: Record<string, { gradient: string; text: string }> = {
  beginner: { gradient: 'from-emerald-50 to-emerald-100', text: 'text-emerald-700' },
  intermediate: { gradient: 'from-brand-50 to-brand-100', text: 'text-brand-700' },
  advanced: { gradient: 'from-orange-50 to-orange-100', text: 'text-orange-700' },
};

export default function ExerciseCard({ exercise, index, onToggle }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cat = categoryConfig[exercise.category] || categoryConfig.warmup;
  const diff = diffConfig[exercise.difficulty] || diffConfig.beginner;

  const handleFeedback = async (difficulty: 'easy' | 'hard') => {
    try {
      const existing = localStorage.getItem('exercise_feedback');
      let feedbacks = existing ? JSON.parse(existing) : [];
      
      feedbacks.push({
        exerciseId: exercise.id,
        title: exercise.title,
        difficulty: difficulty,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem('exercise_feedback', JSON.stringify(feedbacks));
      alert(`🎵 Thanks! We'll adjust tomorrow's practice to be ${difficulty === 'easy' ? 'more challenging' : 'a bit easier'}.`);
    } catch (error) {
      console.error('Failed to save feedback:', error);
      alert('Sorry, couldn\'t save your feedback. But we still appreciate it! 🎶');
    }
  };

  return (
    <div
      className={`card transition-all duration-300 ${exercise.completed ? 'opacity-60 bg-brand-50/50 border-brand-200' : ''}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <button
            onClick={() => onToggle(exercise.id)}
            className="mt-0.5 shrink-0 transition-transform duration-300 active:scale-[0.85] hover:scale-110"
          >
            {exercise.completed ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-700/30">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            ) : (
              <Circle className="w-8 h-8 text-surface-300 hover:text-brand-400 transition-colors" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`badge bg-gradient-to-r ${cat.gradient} text-white border-0 shadow-sm`}>
                {cat.label}
              </span>
              <span className="badge-surface flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />{exercise.duration} min
              </span>
              <span className={`badge bg-gradient-to-r ${diff.gradient} ${diff.text} border-0`}>
                {exercise.difficulty}
              </span>
            </div>
            <h4 className={`font-bold text-surface-900 text-lg mb-1 ${exercise.completed ? 'line-through text-surface-500' : ''}`}>
              {exercise.title}
            </h4>
            <p className="text-sm text-surface-500 leading-relaxed">{exercise.description}</p>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 p-2 rounded-xl hover:bg-brand-50 transition-all duration-200 group"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-surface-400 group-hover:text-brand-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-surface-400 group-hover:text-brand-600" />
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-5 ml-12 animate-slide-up">
            <div className="space-y-4">
              <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100">
                <p className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-3">Instructions</p>
                <ol className="space-y-2.5">
                  {exercise.instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-surface-700">
                      <span className="shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {exercise.tips.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-accent-50 to-amber-50 rounded-xl border-2 border-accent-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-sm">
                      <Lightbulb className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-xs font-bold text-accent-700 uppercase tracking-wider">Pro Tips</p>
                  </div>
                  {exercise.tips.map((tip, i) => (
                    <p key={i} className="text-sm text-accent-700/90 ml-8 mb-1 leading-relaxed">{tip}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => handleFeedback('easy')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                👍 Too Easy
              </button>
              <button
                onClick={() => handleFeedback('hard')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                👎 Too Hard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}