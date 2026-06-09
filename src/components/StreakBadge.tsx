import { useState, useEffect } from 'react';
import { Flame, Award, TrendingUp } from 'lucide-react';
import { calculateStreak, checkBadges, getEarnedBadges, getNextBadge, type Badge } from '../lib/streakTracker';

export default function StreakBadge() {
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [nextBadge, setNextBadge] = useState<Badge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    updateStreak();
  }, []);

  const updateStreak = () => {
    const currentStreak = calculateStreak();
    setStreak(currentStreak);
    
    const newBadges = checkBadges(currentStreak);
    if (newBadges.length > 0) {
      setNewBadge(newBadges[0]);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
    
    setBadges(getEarnedBadges());
    setNextBadge(getNextBadge(currentStreak));
  };

  return (
    <>
      {/* Celebration Animation */}
      {showCelebration && newBadge && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-3">{newBadge.icon}</div>
            <p className="text-white font-bold text-2xl">NEW BADGE!</p>
            <p className="text-yellow-100 text-lg mt-2">{newBadge.name}</p>
            <p className="text-yellow-200 text-sm mt-3">{newBadge.daysRequired} day streak!</p>
          </div>
        </div>
      )}

      {/* Main Streak Display */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border-2 border-orange-200 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Streak Counter */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xs text-orange-600 uppercase tracking-wide font-semibold">Current Streak</p>
              <p className="text-3xl font-bold text-orange-800">{streak} {streak === 1 ? 'day' : 'days'}</p>
            </div>
          </div>

          {/* Next Badge */}
          {nextBadge && (
            <div className="flex items-center gap-3 bg-white/60 rounded-xl px-4 py-2">
              <div className="text-2xl">{nextBadge.icon}</div>
              <div>
                <p className="text-xs text-gray-500">Next badge in</p>
                <p className="text-sm font-bold text-orange-700">{nextBadge.daysRequired - streak} more days</p>
              </div>
            </div>
          )}

          {/* Earned Badges */}
          {badges.length > 0 && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-600" />
              <div className="flex gap-2">
                {badges.slice(-3).map((badge) => (
                  <div key={badge.id} className="tooltip" title={badge.name}>
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                ))}
                {badges.length > 3 && (
                  <span className="text-xs text-gray-500">+{badges.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Motivation Message */}
        {streak === 0 && (
          <p className="text-sm text-orange-600 mt-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Complete your first practice to start your streak!
          </p>
        )}
        {streak > 0 && streak < 7 && (
          <p className="text-sm text-orange-600 mt-3">
            🔥 Keep going! {7 - streak} more days until the Consistent badge!
          </p>
        )}
        {streak >= 7 && (
          <p className="text-sm text-orange-600 mt-3">
            🌟 Amazing dedication! You're a practice master!
          </p>
        )}
      </div>
    </>
  );
}