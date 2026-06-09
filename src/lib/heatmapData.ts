// Practice Heatmap Data

export interface HeatmapDay {
  date: string;
  exercisesCompleted: number;
  xpEarned: number;
  hasPracticed: boolean;
  intensity: number; // 0-4 for color intensity
}

// Get all practice data for heatmap
export function getHeatmapData(): HeatmapDay[] {
  const saved = localStorage.getItem('daily_progress');
  const allProgress = saved ? JSON.parse(saved) : [];
  
  // Get last 90 days
  const heatmapData: HeatmapDay[] = [];
  const today = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const found = allProgress.find((p: any) => p.date === dateStr);
    
    let exercisesCompleted = 0;
    let xpEarned = 0;
    let hasPracticed = false;
    
    if (found) {
      exercisesCompleted = found.exercisesCompleted;
      xpEarned = found.xpEarned;
      hasPracticed = true;
    }
    
    // Calculate intensity (0-4 based on exercises completed)
    let intensity = 0;
    if (hasPracticed) {
      if (exercisesCompleted >= 7) intensity = 4;
      else if (exercisesCompleted >= 5) intensity = 3;
      else if (exercisesCompleted >= 3) intensity = 2;
      else intensity = 1;
    }
    
    heatmapData.push({
      date: dateStr,
      exercisesCompleted,
      xpEarned,
      hasPracticed,
      intensity
    });
  }
  
  return heatmapData;
}

// Get monthly summary stats
export function getMonthlyStats() {
  const heatmapData = getHeatmapData();
  const last30Days = heatmapData.slice(-30);
  
  const daysPracticed = last30Days.filter(d => d.hasPracticed).length;
  const totalExercises = last30Days.reduce((sum, d) => sum + d.exercisesCompleted, 0);
  const totalXP = last30Days.reduce((sum, d) => sum + d.xpEarned, 0);
  const bestStreak = calculateBestStreak(heatmapData);
  
  return {
    daysPracticed,
    totalExercises,
    totalXP,
    bestStreak,
    completionRate: Math.round((daysPracticed / 30) * 100)
  };
}

function calculateBestStreak(data: HeatmapDay[]): number {
  let currentStreak = 0;
  let bestStreak = 0;
  
  for (const day of data) {
    if (day.hasPracticed) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return bestStreak;
}

// Get color based on intensity
export function getHeatmapColor(intensity: number): string {
  switch(intensity) {
    case 0: return 'bg-gray-100 hover:bg-gray-200';
    case 1: return 'bg-green-100 hover:bg-green-200';
    case 2: return 'bg-green-300 hover:bg-green-400';
    case 3: return 'bg-green-500 hover:bg-green-600';
    case 4: return 'bg-green-700 hover:bg-green-800';
    default: return 'bg-gray-100';
  }
}