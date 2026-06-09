// XP and Level System

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  title: string;
}

const LEVELS = [
  { level: 1, xpRequired: 0, title: '🥄 Beginner' },
  { level: 2, xpRequired: 100, title: '🎵 Rookie' },
  { level: 3, xpRequired: 250, title: '🎶 Rising Star' },
  { level: 4, xpRequired: 500, title: '⭐ Performer' },
  { level: 5, xpRequired: 800, title: '🎸 Rocker' },
  { level: 6, xpRequired: 1200, title: '🏆 Virtuoso' },
  { level: 7, xpRequired: 1700, title: '👑 Maestro' },
  { level: 8, xpRequired: 2300, title: '🎭 Legend' },
  { level: 9, xpRequired: 3000, title: '💎 Icon' },
  { level: 10, xpRequired: 4000, title: '🌟 Grand Master' },
];

// Get current XP and level
export function getXPData(): LevelInfo {
  const saved = localStorage.getItem('xp_data');
  let xpData = saved ? JSON.parse(saved) : { totalXP: 0, level: 1 };
  
  let currentLevel = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xpData.totalXP >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i].level;
      break;
    }
  }
  
  const nextLevel = LEVELS.find(l => l.level === currentLevel + 1);
  const currentLevelXP = LEVELS.find(l => l.level === currentLevel)?.xpRequired || 0;
  const nextLevelXP = nextLevel?.xpRequired || currentLevelXP + 500;
  const currentXP = xpData.totalXP - currentLevelXP;
  const xpToNextLevel = nextLevelXP - xpData.totalXP;
  
  return {
    level: currentLevel,
    currentXP: currentXP,
    xpToNextLevel: xpToNextLevel,
    totalXP: xpData.totalXP,
    title: LEVELS[currentLevel - 1]?.title || '🥄 Beginner'
  };
}

// Add XP for completing exercises
export function addXP(amount: number, reason: string): { newTotal: number; leveledUp: boolean; newLevel: number } {
  const saved = localStorage.getItem('xp_data');
  let xpData = saved ? JSON.parse(saved) : { totalXP: 0, level: 1 };
  
  const oldLevel = xpData.level;
  xpData.totalXP += amount;
  
  // Check for level up
  let newLevel = oldLevel;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xpData.totalXP >= LEVELS[i].xpRequired) {
      newLevel = LEVELS[i].level;
      break;
    }
  }
  
  xpData.level = newLevel;
  localStorage.setItem('xp_data', JSON.stringify(xpData));
  
  // Save transaction for history
  const history = localStorage.getItem('xp_history');
  const transactions = history ? JSON.parse(history) : [];
  transactions.push({
    amount,
    reason,
    timestamp: new Date().toISOString(),
    newTotal: xpData.totalXP
  });
  localStorage.setItem('xp_history', JSON.stringify(transactions.slice(-50))); // Keep last 50
  
  return {
    newTotal: xpData.totalXP,
    leveledUp: newLevel > oldLevel,
    newLevel: newLevel
  };
}

// Get XP history (last 10 transactions)
export function getXPHistory(): { amount: number; reason: string; timestamp: string }[] {
  const history = localStorage.getItem('xp_history');
  return history ? JSON.parse(history).slice(-10).reverse() : [];
}

// Calculate XP for completed exercises
export function calculateExerciseXP(exercisesCompleted: number): number {
  return exercisesCompleted * 10; // 10 XP per exercise
}

// Bonus XP for streak milestones
export function getStreakBonusXP(streak: number): number {
  if (streak >= 100) return 500;
  if (streak >= 50) return 250;
  if (streak >= 30) return 150;
  if (streak >= 14) return 75;
  if (streak >= 7) return 40;
  if (streak >= 3) return 15;
  return 0;
}