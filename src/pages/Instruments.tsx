import { useApp } from '../context/AppContext';
import { Music, Mic, Guitar, Piano, Drum, Award } from 'lucide-react';

const instrumentIcons: Record<string, any> = {
  guitar: Guitar,
  piano: Piano,
  drums: Drum,
  vocals: Mic,
  bass: Guitar,
  violin: Music,
  flute: Music,
  saxophone: Music,
  trumpet: Music,
  cello: Music,
};

export default function Instruments() {
  const { student, navigate } = useApp();
  const instruments = student.instruments || [];
  
  if (instruments.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="card p-8">
          <Music className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Instruments Yet</h2>
          <p className="text-surface-500 mb-6">Add your first instrument to start practicing!</p>
          <button onClick={() => navigate('profile')} className="btn-primary">
            Go to Profile
          </button>
        </div>
      </div>
    );
  }
  
  // Group by level
  const foundation = instruments.filter(i => i.gradeLevel <= 2);
  const intermediate = instruments.filter(i => i.gradeLevel >= 3 && i.gradeLevel <= 5);
  const advanced = instruments.filter(i => i.gradeLevel >= 6);
  
  const renderInstrumentCard = (instrument: any, color: string) => {
    const Icon = instrumentIcons[instrument.name] || Music;
    return (
      <div key={instrument.id} className={`flex items-center justify-between p-3 bg-${color}-50 rounded-xl`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${color}-500 rounded-full flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={`font-semibold text-${color}-800`}>
              {instrument.name.charAt(0).toUpperCase() + instrument.name.slice(1)}
              {instrument.isPrimary && <span className={`ml-2 text-xs text-${color}-600`}>(Primary)</span>}
            </p>
            <p className={`text-xs text-${color}-600`}>
              Grade {instrument.gradeLevel} • {instrument.syllabus} • {instrument.genre}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium text-${color}-700`}>Level {instrument.level}</p>
          <p className={`text-xs text-${color}-500`}>{instrument.xp} XP</p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-surface-900 mb-1">My Instruments</h2>
        <p className="text-surface-500">Track your progress across all instruments</p>
      </div>
      
      {/* XP Overview Card */}
      <div className="card p-6 bg-gradient-to-r from-brand-50 to-brand-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-brand-600">Total Across All Instruments</p>
              <p className="text-2xl font-bold text-brand-800">
                {instruments.reduce((sum, i) => sum + (i.xp || 0), 0)} XP
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-brand-600">Highest Level</p>
            <p className="text-xl font-bold text-brand-800">
              {Math.max(...instruments.map(i => i.level || 1))}
            </p>
          </div>
        </div>
      </div>
      
      {/* Foundation Level */}
      {foundation.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-green-700 mb-4 flex items-center gap-2">
            🌱 Foundation Level (Grades 1-2)
          </h3>
          <div className="space-y-3">
            {foundation.map(i => renderInstrumentCard(i, 'green'))}
          </div>
        </div>
      )}
      
      {/* Intermediate Level */}
      {intermediate.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
            📚 Intermediate Level (Grades 3-5)
          </h3>
          <div className="space-y-3">
            {intermediate.map(i => renderInstrumentCard(i, 'blue'))}
          </div>
        </div>
      )}
      
      {/* Advanced Level */}
      {advanced.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
            🏆 Advanced Level (Grades 6-8)
          </h3>
          <div className="space-y-3">
            {advanced.map(i => renderInstrumentCard(i, 'purple'))}
          </div>
        </div>
      )}
      
      <button onClick={() => navigate('profile')} className="btn-secondary w-full justify-center">
        Manage Instruments in Profile
      </button>
    </div>
  );
}