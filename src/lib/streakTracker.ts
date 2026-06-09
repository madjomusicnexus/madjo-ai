// Streak tracking and badge system

export interface Badge {
  id: string;
  name: string;
  icon: string;
  daysRequired: number;
  earned: boolean;
  earnedDate?: string;
}

const BADGES: Badge[] = [
  { id: 'beginner', name: '🥉 First Step', icon: '🌱', daysRequired: 3, earned: false },
  { id: 'consistent', name: '🥈 Consistent', icon: '🔥', daysRequired: 7, earned: false },
  { id: 'dedicated', name: '🥇 Dedicated', icon: '⭐', daysRequired: 14, earned: false },
  { id: 'master', name: '🏆 Practice Master', icon: '🏆', daysRequired: 30, earned: false },
  { id: 'legend', name: '💎 Legend', icon: '💎', daysRequired: 60, earned: false },
  { id: 'immortal', name: '👑 Immortal', icon: '👑', daysRequired: 100, earned: false },
];

// Get practice history from localStorage
export function getPracticeHistory(): string[] {
  const history = localStorage.getItem('practice_history');
  if (!history) return [];
  return JSON.parse(history);
}

// Save today's practice completion
export function markPracticeCompleted(): void {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const history = getPracticeHistory();
  
  if (!history.includes(today)) {
    history.push(today);
    localStorage.setItem('practice_history', JSON.stringify(history));
  }
}

// Calculate current streak
export function calculateStreak(): number {
  const history = getPracticeHistory();
  if (history.length === 0) return 0;
  
  // Sort dates (newest first)
  const sortedDates = [...history].sort().reverse();
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const practiceDate = new Date(sortedDates[i]);
    practiceDate.setHours(0, 0, 0, 0);
    
    const daysDiff = (currentDate.getTime() - practiceDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  return streak;
}

// Check and award new badges
export function checkBadges(currentStreak: number): Badge[] {
  const earnedBadges = localStorage.getItem('earned_badges');
  const earned = earnedBadges ? JSON.parse(earnedBadges) : [];
  
  const updatedBadges = BADGES.map(badge => ({
    ...badge,
    earned: earned.includes(badge.id) || currentStreak >= badge.daysRequired
  }));
  
  // Save newly earned badges
  const newEarned = updatedBadges.filter(b => b.earned && !earned.includes(b.id));
  if (newEarned.length > 0) {
    const allEarned = [...earned, ...newEarned.map(b => b.id)];
    localStorage.setItem('earned_badges', JSON.stringify(allEarned));
    
    // Return new badges for celebration
    return newEarned;
  }
  
  return [];
}

// Get all earned badges
export function getEarnedBadges(): Badge[] {
  const earned = localStorage.getItem('earned_badges');
  const earnedIds = earned ? JSON.parse(earned) : [];
  return BADGES.filter(b => earnedIds.includes(b.id));
}

// Get next badge to earn
export function getNextBadge(currentStreak: number): Badge | null {
  const next = BADGES.find(b => b.daysRequired > currentStreak);
  return next || null;
}