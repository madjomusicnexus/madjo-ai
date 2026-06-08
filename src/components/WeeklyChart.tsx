import { useState, useEffect } from 'react';
import { getWeeklyProgress, getWeeklyStats } from '../lib/progressTracker';

export default function WeeklyChart() {
  const [weeklyData, setWeeklyData] = useState<{ day: string; minutes: number; xpEarned: number }[]>([]);
  const [stats, setStats] = useState({ totalMinutes: 0, totalXP: 0 });
  
  useEffect(() => {
    const data = getWeeklyProgress();
    const weekStats = getWeeklyStats();
    setWeeklyData(data);
    setStats({ totalMinutes: weekStats.totalMinutes || 0, totalXP: weekStats.totalXP || 0 });
  }, []);
  
  if (!weeklyData.length) {
    return (
      <div className="card p-6">
        <div className="text-center py-8 text-surface-400">
          Complete practice to see weekly progress
        </div>
      </div>
    );
  }
  
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 1);
  
  return (
    <div className="card p-6">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">This Week</h3>
        <span className="text-sm text-brand-600">{stats.totalMinutes} min</span>
      </div>
      <div className="flex items-end justify-between gap-2 h-32">
        {weeklyData.map((day) => (
          <div key={day.day} className="flex-1 text-center">
            <div className="bg-brand-200 rounded-t-lg transition-all" style={{ height: `${(day.minutes / maxMinutes) * 80}px` }} />
            <span className="text-xs text-surface-500">{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
