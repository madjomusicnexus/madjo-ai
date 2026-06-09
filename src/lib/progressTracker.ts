// Track daily progress for weekly summary

export interface DailyProgress {
  date: string;
  exercisesCompleted: number;
  xpEarned: number;
  routineCompleted: boolean;
}

// Save daily progress after completing a routine
export function saveDailyProgress(exercisesCompleted: number, xpEarned: number): void {
  const today = new Date().toISOString().split('T')[0];
  
  const saved = localStorage.getItem('daily_progress');
  let progress: DailyProgress[] = saved ? JSON.parse(saved) : [];
  
  // Check if today already exists
  const existingIndex = progress.findIndex(p => p.date === today);
  
  const todayProgress: DailyProgress = {
    date: today,
    exercisesCompleted,
    xpEarned,
    routineCompleted: true
  };
  
  if (existingIndex >= 0) {
    progress[existingIndex] = todayProgress;
  } else {
    progress.push(todayProgress);
  }
  
  // Keep only last 30 days
  progress = progress.slice(-30);
  
  localStorage.setItem('daily_progress', JSON.stringify(progress));
}

// Get last 7 days of progress
export function getWeeklyProgress(): DailyProgress[] {
  const saved = localStorage.getItem('daily_progress');
  const allProgress: DailyProgress[] = saved ? JSON.parse(saved) : [];
  
  // Get last 7 days
  const last7Days: DailyProgress[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const found = allProgress.find(p => p.date === dateStr);
    if (found) {
      last7Days.push(found);
    } else {
      last7Days.push({
        date: dateStr,
        exercisesCompleted: 0,
        xpEarned: 0,
        routineCompleted: false
      });
    }
  }
  
  return last7Days;
}

// Get weekly summary stats
export function getWeeklyStats() {
  const weekly = getWeeklyProgress();
  
  const totalExercises = weekly.reduce((sum, d) => sum + d.exercisesCompleted, 0);
  const totalXP = weekly.reduce((sum, d) => sum + d.xpEarned, 0);
  const daysPracticed = weekly.filter(d => d.routineCompleted).length;
  const bestDay = Math.max(...weekly.map(d => d.exercisesCompleted), 0);
  
  return {
    totalExercises,
    totalXP,
    daysPracticed,
    bestDay,
    completionRate: Math.round((daysPracticed / 7) * 100)
  };
}