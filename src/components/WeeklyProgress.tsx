import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getWeeklyProgress, getWeeklyStats, type DailyProgress } from '../lib/progressTracker';

export default function WeeklyProgress() {
  const [weeklyData, setWeeklyData] = useState<DailyProgress[]>([]);
  const [stats, setStats] = useState({ totalExercises: 0, totalXP: 0, daysPracticed: 0, bestDay: 0, completionRate: 0 });
  const [view, setView] = useState<'exercises' | 'xp'>('exercises');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setWeeklyData(getWeeklyProgress());
    setStats(getWeeklyStats());
  };

  const maxValue = view === 'exercises' 
    ? Math.max(...weeklyData.map(d => d.exercisesCompleted), 5)
    : Math.max(...weeklyData.map(d => d.xpEarned), 50);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Get day of week for each date
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1];
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-blue-800">Weekly Progress</h3>
        </div>
        <div className="flex gap-1 bg-white/60 rounded-lg p-0.5">
          <button
            onClick={() => setView('exercises')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${view === 'exercises' ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-600'}`}
          >
            Exercises
          </button>
          <button
            onClick={() => setView('xp')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${view === 'xp' ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-600'}`}
          >
            XP
          </button>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-2 h-40 mb-4">
        {weeklyData.map((day, i) => {
          const value = view === 'exercises' ? day.exercisesCompleted : day.xpEarned;
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const hasPractice = day.routineCompleted;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-blue-600 cursor-pointer"
                style={{ height: `${height}%`, minHeight: '4px' }}
              >
                {value > 0 && (
                  <div className="text-center text-white text-xs font-bold -mt-5">
                    {value}
                  </div>
                )}
              </div>
              <div className="text-center">
                <span className="text-xs text-blue-600 font-medium">{getDayName(day.date)}</span>
                {hasPractice && (
                  <div className="text-green-500 text-xs">✓</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-blue-200">
        <div className="text-center">
          <p className="text-xs text-blue-500">Days</p>
          <p className="text-xl font-bold text-blue-700">{stats.daysPracticed}/7</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-blue-500">Exercises</p>
          <p className="text-xl font-bold text-blue-700">{stats.totalExercises}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-blue-500">Total XP</p>
          <p className="text-xl font-bold text-blue-700">{stats.totalXP}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-blue-500">Best Day</p>
          <p className="text-xl font-bold text-blue-700">{stats.bestDay}</p>
        </div>
      </div>

      {/* Completion Message */}
      {stats.completionRate === 100 && (
        <div className="mt-3 text-center text-xs text-green-600 bg-green-100 rounded-lg py-1">
          🌟 Perfect week! Amazing dedication! 🌟
        </div>
      )}
      {stats.completionRate >= 70 && stats.completionRate < 100 && (
        <div className="mt-3 text-center text-xs text-blue-600 bg-blue-100 rounded-lg py-1">
          📈 Great progress! {stats.completionRate}% of days practiced!
        </div>
      )}
      {stats.completionRate < 70 && stats.daysPracticed > 0 && (
        <div className="mt-3 text-center text-xs text-orange-600 bg-orange-100 rounded-lg py-1">
          💪 Keep going! Try to practice {7 - stats.daysPracticed} more days this week!
        </div>
      )}
    </div>
  );
}