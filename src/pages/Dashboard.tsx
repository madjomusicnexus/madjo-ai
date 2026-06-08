import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/StatsCard';
import ExerciseCard from '../components/ExerciseCard';
import StreakBadge from '../components/StreakBadge';
import LevelCard from '../components/LevelCard';
import WeeklyProgress from '../components/WeeklyProgress';
import PracticeHeatmap from '../components/PracticeHeatmap';
import InstrumentSelector from '../components/InstrumentSelector';
import { Clock, Flame, Trophy, Target, Sparkles, ChevronRight, Music, Wifi, WifiOff, Download } from 'lucide-react';
import { generateReportHTML, downloadPDF, type ReportData } from '../lib/pdfExport';

export default function Dashboard() {
  const { student, routine, navigate, isOffline, syncProgress } = useApp();
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(
    student.instruments?.find(i => i.isPrimary)?.id || student.instruments?.[0]?.id || ''
  );

  const completedCount = routine?.exercises.filter((e) => e.completed).length ?? 0;
  const totalCount = routine?.exercises.length ?? 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

  // Get REAL stats from practice data
  const getRealStats = () => {
    const streakData = localStorage.getItem('practice_history');
    const streaks = streakData ? JSON.parse(streakData) : [];
    
    const xpData = localStorage.getItem('xp_data');
    const xp = xpData ? JSON.parse(xpData) : { totalXP: 0, level: 1 };
    
    const progressData = localStorage.getItem('daily_progress');
    const progress = progressData ? JSON.parse(progressData) : [];
    
    const totalExercises = progress.reduce((sum: number, p: any) => sum + (p.exercisesCompleted || 0), 0);
    const totalPracticeMinutes = progress.reduce((sum: number, p: any) => sum + (p.exercisesCompleted * 5 || 0), 0);
    
    const gradeProgress = Math.min(100, Math.floor((xp.totalXP / 1000) * 100));
    
    return {
      streak: streaks.length,
      totalXP: xp.totalXP,
      level: xp.level,
      totalExercises,
      totalPracticeMinutes,
      gradeProgress
    };
  };

  const stats = getRealStats();

  const exportReport = () => {
    const streakData = localStorage.getItem('practice_history');
    const streaks = streakData ? JSON.parse(streakData) : [];
    const xpData = localStorage.getItem('xp_data');
    const xp = xpData ? JSON.parse(xpData) : { totalXP: 0, level: 1 };
    const progressData = localStorage.getItem('daily_progress');
    const progress = progressData ? JSON.parse(progressData) : [];
    
    const levels = ['', 'Beginner', 'Rookie', 'Rising Star', 'Performer', 'Rocker', 'Virtuoso', 'Maestro', 'Legend', 'Icon', 'Grand Master'];
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];
      const dayProgress = progress.find((p: any) => p.date === dateStr);
      last7Days.push({
        day: dayName,
        exercises: dayProgress?.exercisesCompleted || 0,
        xp: dayProgress?.xpEarned || 0
      });
    }
    
    const reportData: ReportData = {
      studentName: student.name,
      instrument: student.instruments?.find(i => i.isPrimary)?.name || 'Music',
      gradeLevel: student.instruments?.find(i => i.isPrimary)?.gradeLevel || 1,
      dateRange: `Last 30 days`,
      streakDays: streaks.length,
      totalXP: xp.totalXP,
      level: xp.level,
      levelTitle: levels[xp.level] || 'Beginner',
      weeklyData: last7Days,
      totalExercises: progress.reduce((sum: number, p: any) => sum + (p.exercisesCompleted || 0), 0),
      totalPracticeDays: progress.filter((p: any) => p.routineCompleted).length
    };
    
    const html = generateReportHTML(reportData);
    downloadPDF(html, `practice-report-${student.name}-${new Date().toISOString().split('T')[0]}.html`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-700">You're offline. Using cached routines.</span>
          </div>
          <button onClick={syncProgress} className="text-xs text-yellow-700 underline flex items-center gap-1">
            <Download className="w-3 h-3" /> Sync when online
          </button>
        </div>
      )}

      {!isOffline && (
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">You're online. Progress auto-syncs.</span>
          </div>
          <button onClick={syncProgress} className="text-xs text-green-700 underline flex items-center gap-1">
            <Download className="w-3 h-3" /> Manual Sync
          </button>
        </div>
      )}

      {/* Header with Instrument Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">
            Good {greeting}, {student.name.split(' ')[0]}
          </h2>
          <p className="text-surface-500 mt-1">Here's your practice overview for today.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {student.instruments && student.instruments.length > 0 && (
            <div className="w-64">
              <InstrumentSelector 
                instruments={student.instruments}
                selectedInstrumentId={selectedInstrumentId}
                onSelect={setSelectedInstrumentId}
              />
            </div>
          )}
          <button onClick={() => navigate('generate')} className="btn-primary">
            <Sparkles className="w-4 h-4" /> Generate
          </button>
        </div>
      </div>

      {/* Streak Badge */}
      <StreakBadge />

      {/* Level Card */}
      <LevelCard />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Practice Time" value={`${stats.totalPracticeMinutes}`} icon={<Clock className="w-5 h-5" />} trend={`${Math.round(stats.totalPracticeMinutes / 60)} hrs`} color="brand" />
        <StatsCard label="Current Streak" value={`${stats.streak} days`} icon={<Flame className="w-5 h-5" />} trend="Keep going!" color="accent" />
        <StatsCard label="Exercises Done" value={stats.totalExercises.toString()} icon={<Trophy className="w-5 h-5" />} color="brand" />
        <StatsCard label="Grade Progress" value={`${stats.gradeProgress}%`} icon={<Target className="w-5 h-5" />} color="surface" />
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-md shadow-brand-600/20">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="section-title">Today's Routine</h3>
                  <p className="text-sm text-surface-500">{routine?.focusArea}</p>
                </div>
              </div>
              <button onClick={() => navigate('routine')} className="btn-ghost text-sm">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-surface-600 font-medium">{completedCount} of {totalCount} completed</span>
                <span className="text-brand-600 font-semibold">{progressPct}%</span>
              </div>
              <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                <div className="h-full gradient-brand rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              {routine?.exercises.slice(0, 3).map((ex, i) => (
                <ExerciseCard key={ex.id} exercise={ex} index={i} onToggle={() => {}} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <WeeklyProgress />
          <PracticeHeatmap />

          <div className="card p-6">
            <h3 className="section-title mb-4">Grade Progress</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(stats.gradeProgress / 100) * 314} 314`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-surface-900">{stats.gradeProgress}%</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => navigate('generate')} className="w-full btn-secondary justify-start text-sm">
                <Sparkles className="w-4 h-4" /> Generate New Routine
              </button>
              <button onClick={() => navigate('instruments')} className="w-full btn-secondary justify-start text-sm">
                <Music className="w-4 h-4" /> My Instruments
              </button>
              <button onClick={() => navigate('profile')} className="w-full btn-secondary justify-start text-sm">
                <Target className="w-4 h-4" /> Edit Profile
              </button>
              <button onClick={exportReport} className="w-full btn-secondary justify-start text-sm">
                <Download className="w-4 h-4" /> Export PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}