import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeatmapData, getMonthlyStats, getHeatmapColor, type HeatmapDay } from '../lib/heatmapData';

export default function PracticeHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [stats, setStats] = useState({ daysPracticed: 0, totalExercises: 0, totalXP: 0, bestStreak: 0, completionRate: 0 });
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setHeatmapData(getHeatmapData());
    setStats(getMonthlyStats());
  };

  // Get days for current month view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (HeatmapDay | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const found = heatmapData.find(h => h.date === dateStr);
      days.push(found || {
        date: dateStr,
        exercisesCompleted: 0,
        xpEarned: 0,
        hasPracticed: false,
        intensity: 0
      });
    }
    
    return days;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentMonth);
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-emerald-800">Practice Heatmap</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-emerald-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-emerald-600" />
          </button>
          <span className="text-sm font-medium text-emerald-700">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-emerald-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-emerald-500 font-medium py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg transition-all duration-200 cursor-pointer ${day ? getHeatmapColor(day.intensity) : 'bg-transparent'}`}
              onMouseEnter={() => day && setSelectedDay(day)}
              onMouseLeave={() => setSelectedDay(null)}
            >
              {day && day.hasPracticed && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium opacity-0 hover:opacity-100 transition-opacity">
                    {day.exercisesCompleted}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="text-emerald-600">Less</span>
        <div className="flex gap-1">
          <div className="w-5 h-5 rounded bg-gray-100"></div>
          <div className="w-5 h-5 rounded bg-green-100"></div>
          <div className="w-5 h-5 rounded bg-green-300"></div>
          <div className="w-5 h-5 rounded bg-green-500"></div>
          <div className="w-5 h-5 rounded bg-green-700"></div>
        </div>
        <span className="text-emerald-600">More</span>
      </div>

      {/* Tooltip / Selected Day Info */}
      {selectedDay && selectedDay.hasPracticed && (
        <div className="mb-4 p-3 bg-white rounded-xl shadow-sm border border-emerald-200 animate-fade-in">
          <p className="text-sm font-semibold text-emerald-800">
            {new Date(selectedDay.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
          </p>
          <div className="flex gap-4 mt-1">
            <span className="text-xs text-emerald-600">📝 {selectedDay.exercisesCompleted} exercises</span>
            <span className="text-xs text-emerald-600">⭐ {selectedDay.xpEarned} XP</span>
          </div>
        </div>
      )}

      {/* Monthly Stats Summary */}
      <div className="grid grid-cols-5 gap-2 pt-3 border-t border-emerald-200">
        <div className="text-center">
          <p className="text-xs text-emerald-500">Practiced</p>
          <p className="text-lg font-bold text-emerald-700">{stats.daysPracticed}/30</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-emerald-500">Streak</p>
          <p className="text-lg font-bold text-emerald-700">{stats.bestStreak}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-emerald-500">Exercises</p>
          <p className="text-lg font-bold text-emerald-700">{stats.totalExercises}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-emerald-500">Total XP</p>
          <p className="text-lg font-bold text-emerald-700">{stats.totalXP}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-emerald-500">Rate</p>
          <p className="text-lg font-bold text-emerald-700">{stats.completionRate}%</p>
        </div>
      </div>

      {/* Motivation Message */}
      {stats.completionRate >= 80 && (
        <div className="mt-3 text-center text-xs text-emerald-600 bg-emerald-100 rounded-lg py-1">
          🔥 Incredible consistency! You're on fire! 🔥
        </div>
      )}
      {stats.completionRate >= 50 && stats.completionRate < 80 && (
        <div className="mt-3 text-center text-xs text-emerald-600 bg-emerald-100 rounded-lg py-1">
          🌟 Great work! Keep building that streak! 🌟
        </div>
      )}
      {stats.completionRate < 50 && stats.daysPracticed > 0 && (
        <div className="mt-3 text-center text-xs text-orange-600 bg-orange-100 rounded-lg py-1">
          💪 Every day counts! Try to practice a little each day! 💪
        </div>
      )}
    </div>
  );
}