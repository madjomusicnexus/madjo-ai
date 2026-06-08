import { useState, useEffect } from 'react';
import { Award, Sparkles } from 'lucide-react';
import { getXPData, getXPHistory, type LevelInfo } from '../lib/xpSystem';

export default function LevelCard() {
  const [xpData, setXpData] = useState<LevelInfo | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelTitle, setNewLevelTitle] = useState('');
  const [history, setHistory] = useState<{ amount: number; reason: string; timestamp: string }[]>([]);

  useEffect(() => {
    refreshData();
    
    // Check for level up celebration
    const justLeveledUp = localStorage.getItem('just_leveled_up');
    if (justLeveledUp) {
      setNewLevelTitle(justLeveledUp);
      setShowLevelUp(true);
      setTimeout(() => {
        setShowLevelUp(false);
        localStorage.removeItem('just_leveled_up');
      }, 4000);
    }
  }, []);

  const refreshData = () => {
    setXpData(getXPData());
    setHistory(getXPHistory());
  };

  if (!xpData) return null;

  const progressPercent = xpData.xpToNextLevel > 0 
    ? (xpData.currentXP / (xpData.currentXP + xpData.xpToNextLevel)) * 100 
    : 100;

  return (
    <>
      {/* Level Up Celebration */}
      {showLevelUp && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-3">🎉</div>
            <p className="text-white font-bold text-2xl">LEVEL UP!</p>
            <p className="text-yellow-200 text-lg mt-2">You are now {newLevelTitle}</p>
          </div>
        </div>
      )}

      {/* Main Level Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Level Badge */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-600 uppercase tracking-wide font-semibold">Level {xpData.level}</p>
              <p className="text-xl font-bold text-purple-800">{xpData.title}</p>
              <p className="text-xs text-purple-500 mt-1">{xpData.totalXP} total XP</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="flex-1 min-w-[150px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-purple-600">XP to next level</span>
              <span className="text-purple-700 font-semibold">{xpData.xpToNextLevel} XP needed</span>
            </div>
            <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-purple-500 mt-1">
              {xpData.currentXP} / {xpData.currentXP + xpData.xpToNextLevel} XP
            </p>
          </div>
        </div>

        {/* Recent XP Gains */}
        {history.length > 0 && (
          <div className="mt-4 pt-3 border-t border-purple-200">
            <p className="text-xs text-purple-600 font-semibold mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Recent gains
            </p>
            <div className="flex gap-3 flex-wrap">
              {history.slice(0, 3).map((item, i) => (
                <div key={i} className="bg-white/60 rounded-lg px-2 py-1 text-xs">
                  <span className="text-green-600 font-bold">+{item.amount}</span>
                  <span className="text-gray-500 ml-1">{item.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}