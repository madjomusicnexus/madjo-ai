import { useState, useEffect } from 'react';
import { Play, Pause, Heart, Music2, Fingerprint } from 'lucide-react';

interface MetronomeProps {
  suggestedTempo?: number;
  exerciseDifficulty?: string;
  exerciseType?: string;
}

export default function Metronome({ suggestedTempo = 120 }: MetronomeProps) {
  const [bpm, setBpm] = useState(suggestedTempo);
  const [isActive, setIsActive] = useState(false);

  const toggleMetronome = () => {
    setIsActive(!isActive);
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(Math.min(200, Math.max(40, newBpm)));
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-purple-800">Metronome</h3>
        </div>
        <button className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1">
          <Music2 className="w-3 h-3" /> Suggested Tempo
        </button>
      </div>
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-purple-800">{bpm}</div>
        <div className="text-xs text-purple-500">BEATS PER MINUTE</div>
      </div>
      <input type="range" min="40" max="200" value={bpm} onChange={(e) => handleBpmChange(parseInt(e.target.value))} className="w-full mb-4" />
      <div className="flex gap-3">
        <button onClick={toggleMetronome} className={`flex-1 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'}`}>
          {isActive ? <Pause className="w-4 h-4 inline mr-2" /> : <Play className="w-4 h-4 inline mr-2" />}
          {isActive ? 'Stop' : 'Start'}
        </button>
        <button className="px-4 py-3 rounded-xl bg-white border-2 border-purple-300 text-purple-600 font-medium">
          <Fingerprint className="w-4 h-4 inline mr-2" />
          Tap Tempo
        </button>
      </div>
    </div>
  );
}
