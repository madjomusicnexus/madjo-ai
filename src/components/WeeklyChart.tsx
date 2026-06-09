import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface WeeklyData {
  day: string;
  minutes: number;
  xpEarned: number;
}

interface WeeklyStats {
  totalMinutes: number;
  totalXP: number;
}

export default function WeeklyChart() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [stats, setStats] = useState<WeeklyStats>({ totalMinutes: 0, totalXP: 0 });

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get last 7 days of data
    const { data: progress } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7);

    if (progress) {
      const formattedData: WeeklyData[] = progress.map(p => ({
        day: new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: p.minutes_practiced || 0,
        xpEarned: p.xp_earned || 0,
      }));

      setWeeklyData(formattedData);

      const totalMinutes = formattedData.reduce((sum, d) => sum + d.minutes, 0);
      const totalXP = formattedData.reduce((sum, d) => sum + d.xpEarned, 0);
      
      setStats({ totalMinutes, totalXP });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-semibold text-surface-900 mb-3">Weekly Progress</h3>
      <div className="flex justify-between gap-2">
        {weeklyData.map((day, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="text-xs text-surface-500">{day.day}</div>
            <div className="mt-1 h-16 bg-surface-100 rounded-full overflow-hidden">
              <div 
                className="bg-brand-500 transition-all duration-300"
                style={{ height: `${Math.min(100, (day.minutes / 60) * 100)}%` }}
              />
            </div>
            <div className="text-xs font-medium mt-1">{day.minutes}min</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-surface-100 flex justify-between">
        <div>
          <div className="text-xs text-surface-500">Total Minutes</div>
          <div className="text-lg font-bold">{stats.totalMinutes}</div>
        </div>
        <div>
          <div className="text-xs text-surface-500">Total XP</div>
          <div className="text-lg font-bold">{stats.totalXP}</div>
        </div>
      </div>
    </div>
  );
}
