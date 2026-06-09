import { useState, useEffect } from 'react';
import { Play, Pause, Heart, Music2, Fingerprint } from 'lucide-react';
import { startMetronome, stopMetronome, setMetronomeBPM, getTempoSuggestion, initAudioContext } from '../lib/metronomeSounds';

interface MetronomeProps {
  suggestedTempo?: number;
  exerciseDifficulty?: string;
  exerciseType?: string;
}

export default function Metronome({ suggestedTempo, exerciseDifficulty = 'intermediate', exerciseType = 'technique' }: MetronomeProps) {
  const [bpm, setBpm] = useState(suggestedTempo || getTempoSuggestion(exerciseDifficulty, exerciseType));
  const [isActive, setIsActive] = useState(false);
  const [lastTapTime, setLastTapTime] = useState<number | null>(null);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    // Listen for metronome clicks for visual pulse
    const handleClick = () => {
      setPulseIntensity(1);
      setTimeout(() => setPulseIntensity(0), 150);
    };
    
    window.addEventListener('metronome-click', handleClick as EventListener);
    return () => window.removeEventListener('metronome-click', handleClick as EventListener);
  }, []);

  // Initialize audio on first user interaction
  const initAudio = async () => {
    try {
      await initAudioContext();
      setAudioReady(true);
    } catch (e) {
      console.log('Audio init failed:', e);
    }
  };

  const toggleMetronome = () => {
    if (!audioReady) {
      initAudio();
      setTimeout(() => toggleMetronome(), 100);
      return;
    }
    
    if (isActive) {
      stopMetronome();
      setIsActive(false);
    } else {
      startMetronome(bpm, () => {
        // Visual feedback already handled by event
      });
      setIsActive(true);
    }
  };

  const handleBpmChange = (newBpm: number) => {
    const clamped = Math.min(200, Math.max(40, newBpm));
    setBpm(clamped);
    if (isActive) {
      setMetronomeBPM(clamped);
    }
  };

  const handleTapTempo = () => {
    const now = Date.now();
    
    if (lastTapTime && (now - lastTapTime) < 2000) {
      const newTapTimes = [...tapTimes, now];
      const recentTaps = newTapTimes.filter(t => (now - t) < 5000);
      setTapTimes(recentTaps);
      
      if (recentTaps.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < recentTaps.length; i++) {
          intervals.push(recentTaps[i] - recentTaps[i-1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const newBpm = Math.round(60000 / avgInterval);
        handleBpmChange(Math.min(200, Math.max(40, newBpm)));
      }
    } else {
      setTapTimes([now]);
    }
    
    setLastTapTime(now);
  };

  const getSuggestion = () => {
    const suggested = getTempoSuggestion(exerciseDifficulty, exerciseType);
    handleBpmChange(suggested);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-purple-800">Metronome</h3>
        </div>
        <button
          onClick={getSuggestion}
          className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1"
        >
          <Music2 className="w-3 h-3" /> Suggested Tempo
        </button>
      </div>

      {/* BPM Display & Controls */}
      <div className="text-center mb-4">
        <div 
          className={`text-5xl font-bold text-purple-700 mb-2 transition-all duration-100 ${pulseIntensity ? 'scale-110 text-purple-500' : ''}`}
        >
          {bpm}
        </div>
        <p className="text-xs text-purple-500">BEATS PER MINUTE</p>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="40"
          max="200"
          value={bpm}
          onChange={(e) => handleBpmChange(parseInt(e.target.value))}
          className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-purple-400 mt-1">
          <span>Largo (40)</span>
          <span>Moderato (90)</span>
          <span>Allegro (120)</span>
          <span>Presto (200)</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        <button
          onClick={toggleMetronome}
          className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            isActive 
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? 'Stop' : 'Start'}
        </button>
        
        <button
          onClick={handleTapTempo}
          className="px-4 py-3 rounded-xl bg-white border-2 border-purple-300 text-purple-600 font-medium hover:bg-purple-50 transition-all duration-200 flex items-center gap-2"
        >
          <Fingerprint className="w-4 h-4" />
          Tap Tempo
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-purple-400 text-center">
        💡 Click "Tap Tempo" repeatedly to match the song's beat
      </div>
    </div>
  );
}