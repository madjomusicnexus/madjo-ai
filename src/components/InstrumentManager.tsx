import { useState } from 'react';
import { Plus, Trash2, Star, Music, Mic, Guitar, Piano, Drum } from 'lucide-react';
import type { Instrument, Syllabus, Genre, StudentInstrument } from '../types';

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

const instrumentNames: Record<string, string> = {
  piano: 'Piano',
  guitar: 'Guitar',
  violin: 'Violin',
  drums: 'Drums',
  vocals: 'Vocals',
  bass: 'Bass',
  flute: 'Flute',
  saxophone: 'Saxophone',
  cello: 'Cello',
  trumpet: 'Trumpet',
};

const syllabusOptions = [
  { value: 'abrsm', label: 'ABRSM' },
  { value: 'trinity', label: 'Trinity' },
  { value: 'rockschool', label: 'Rockschool' },
  { value: 'trinity-rock-pop', label: 'Trinity Rock & Pop' },
  { value: 'berklee', label: 'Berklee' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'blues', label: 'Blues' },
  { value: 'custom', label: 'Custom' },
];

const genreOptions = [
  { value: 'classical', label: 'Classical' },
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'blues', label: 'Blues' },
  { value: 'metal', label: 'Metal' },
  { value: 'funk', label: 'Funk' },
];

interface InstrumentManagerProps {
  instruments: StudentInstrument[];
  onUpdate: (instruments: StudentInstrument[]) => void;
  singingWhilePlaying: boolean;
  onToggleSingingWhilePlaying: (enabled: boolean) => void;
}

export default function InstrumentManager({
  instruments,
  onUpdate,
  singingWhilePlaying,
  onToggleSingingWhilePlaying
}: InstrumentManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInstrument, setNewInstrument] = useState<Partial<StudentInstrument>>({
    name: 'piano',
    gradeLevel: 1,
    syllabus: 'abrsm',
    genre: 'classical',
    isPrimary: false,
  });

  const availableInstruments = (Object.keys(instrumentNames) as Instrument[]).filter(
    name => !instruments.some((i: StudentInstrument) => i.name === name)
  );

  const addInstrument = () => {
    if (newInstrument.name && !instruments.some(i => i.name === newInstrument.name)) {
      const instrument: StudentInstrument = {
        id: `${Date.now()}-${newInstrument.name}`,
        name: newInstrument.name as Instrument,
        isPrimary: instruments.length === 0, // First instrument becomes primary
        gradeLevel: newInstrument.gradeLevel as any || 1,
        syllabus: newInstrument.syllabus as Syllabus || 'abrsm',
        genre: newInstrument.genre as Genre || 'classical',
        xp: 0,
        level: 1,
      };
      onUpdate([...instruments, instrument]);
    }
    setShowAddModal(false);
    setNewInstrument({ name: 'piano', gradeLevel: 1, syllabus: 'abrsm', genre: 'classical', isPrimary: false });
  };

  const removeInstrument = (id: string) => {
    const updated = instruments.filter(i => i.id !== id);
    // If we removed the primary instrument, make another one primary
    if (updated.length > 0 && !updated.some(i => i.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onUpdate(updated);
  };

  const setPrimary = (id: string) => {
    const updated = instruments.map(i => ({
      ...i,
      isPrimary: i.id === id
    }));
    onUpdate(updated);
  };

  const updateInstrumentSettings = (id: string, updates: Partial<StudentInstrument>) => {
    const updated = instruments.map(i => 
      i.id === id ? { ...i, ...updates } : i
    );
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      {/* Singing While Playing Toggle */}
      <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Mic className="w-5 h-5 text-purple-600" />
              <Music className="w-4 h-4 text-purple-600 -ml-1 mt-3" />
            </div>
            <div>
              <p className="font-semibold text-purple-800">Singing & Playing Together</p>
              <p className="text-xs text-purple-600">Special exercises for coordination</p>
            </div>
          </div>
          <button
            onClick={() => onToggleSingingWhilePlaying(!singingWhilePlaying)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              singingWhilePlaying 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-white text-purple-600 border-2 border-purple-300'
            }`}
          >
            {singingWhilePlaying ? '✅ Enabled' : 'Enable'}
          </button>
        </div>
        
        {singingWhilePlaying && (
          <div className="mt-3 text-xs text-purple-600 bg-white/60 rounded-lg p-2">
            💡 Exercises will include: playing simplified parts while singing, rhythm coordination drills, and gradual complexity building.
          </div>
        )}
      </div>

      {/* Instruments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="input-label flex items-center gap-2">
            <Music className="w-4 h-4" /> My Instruments
          </label>
          {availableInstruments.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Instrument
            </button>
          )}
        </div>

        {instruments.length === 0 && (
          <div className="text-center py-8 bg-surface-50 rounded-xl">
            <Music className="w-12 h-12 text-surface-300 mx-auto mb-2" />
            <p className="text-surface-500">No instruments added yet</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary mt-3 text-sm">
              Add Your First Instrument
            </button>
          </div>
        )}

        {instruments.map((instrument) => {
          const Icon = instrumentIcons[instrument.name] || Music;
          return (
            <div key={instrument.id} className="bg-white rounded-xl p-4 border border-surface-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    instrument.isPrimary ? 'bg-brand-100' : 'bg-surface-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${instrument.isPrimary ? 'text-brand-600' : 'text-surface-500'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900">
                      {instrumentNames[instrument.name]}
                      {instrument.isPrimary && <span className="ml-2 text-xs text-brand-600">(Primary)</span>}
                    </p>
                    <p className="text-xs text-surface-500">Level {instrument.level} • {instrument.xp} XP</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!instrument.isPrimary && instruments.length > 1 && (
                    <button
                      onClick={() => setPrimary(instrument.id)}
                      className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-500"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeInstrument(instrument.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-surface-500">Grade</label>
                  <select
                    value={instrument.gradeLevel}
                    onChange={(e) => updateInstrumentSettings(instrument.id, { gradeLevel: parseInt(e.target.value) as any })}
                    className="w-full text-sm border border-surface-200 rounded-lg p-1.5 mt-1"
                  >
                    {[1,2,3,4,5,6,7,8].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-surface-500">Syllabus</label>
                  <select
                    value={instrument.syllabus}
                    onChange={(e) => updateInstrumentSettings(instrument.id, { syllabus: e.target.value as Syllabus })}
                    className="w-full text-sm border border-surface-200 rounded-lg p-1.5 mt-1"
                  >
                    {syllabusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-surface-500">Genre</label>
                  <select
                    value={instrument.genre}
                    onChange={(e) => updateInstrumentSettings(instrument.id, { genre: e.target.value as Genre })}
                    className="w-full text-sm border border-surface-200 rounded-lg p-1.5 mt-1"
                  >
                    {genreOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Instrument Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add Instrument</h3>
            <div className="space-y-4">
              <div>
                <label className="input-label">Instrument</label>
                <select
                  value={newInstrument.name}
                  onChange={(e) => setNewInstrument({ ...newInstrument, name: e.target.value as Instrument })}
                  className="input-field"
                >
                  {availableInstruments.map(name => (
                    <option key={name} value={name}>{instrumentNames[name]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Starting Grade</label>
                <select
                  value={newInstrument.gradeLevel}
                  onChange={(e) => setNewInstrument({ ...newInstrument, gradeLevel: parseInt(e.target.value) as any })}
                  className="input-field"
                >
                  {[1,2,3,4,5,6,7,8].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary">
                Cancel
              </button>
              <button onClick={addInstrument} className="flex-1 btn-primary">
                Add Instrument
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}