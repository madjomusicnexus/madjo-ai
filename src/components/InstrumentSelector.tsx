import { Music, Mic, Guitar, Piano, Drum, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { StudentInstrument } from '../types';

interface InstrumentSelectorProps {
  instruments: StudentInstrument[];
  selectedInstrumentId: string;
  onSelect: (id: string) => void;
}

const instrumentIcons: Record<string, any> = {
  guitar: Guitar,
  piano: Piano,
  drums: Drum,
  vocals: Mic,
  bass: Guitar,
  violin: Music,
  flute: Music,
  saxophone: Music,
  cello: Music,
  trumpet: Music,
};

export default function InstrumentSelector({ instruments, selectedInstrumentId, onSelect }: InstrumentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = instruments.find(i => i.id === selectedInstrumentId);
  const Icon = selected ? (instrumentIcons[selected.name] || Music) : Music;

  if (instruments.length === 0) {
    return <div className="text-center text-surface-400 text-sm p-3">No instruments added</div>;
  }

  if (instruments.length === 1) {
    const single = instruments[0];
    const SingleIcon = instrumentIcons[single.name] || Music;
    return (
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
          <SingleIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-brand-900 capitalize">{single.name}</p>
          <p className="text-xs text-brand-600">Grade {single.gradeLevel} • {single.syllabus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-gradient-to-r from-brand-50 to-brand-100 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-brand-900 capitalize">{selected?.name || 'Select Instrument'}</p>
            {selected && <p className="text-xs text-brand-600">Grade {selected.gradeLevel} • {selected.syllabus}</p>}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-brand-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">
          {instruments.map(instrument => {
            const ItemIcon = instrumentIcons[instrument.name] || Music;
            return (
              <button key={instrument.id} onClick={() => { onSelect(instrument.id); setIsOpen(false); }} className="w-full p-3 flex items-center gap-3 hover:bg-brand-50 text-left">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedInstrumentId === instrument.id ? 'bg-brand-500' : 'bg-surface-200'}`}>
                  <ItemIcon className={`w-4 h-4 ${selectedInstrumentId === instrument.id ? 'text-white' : 'text-surface-500'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${selectedInstrumentId === instrument.id ? 'text-brand-700' : 'text-surface-700'} capitalize`}>{instrument.name}</p>
                  <p className="text-xs text-surface-400">Grade {instrument.gradeLevel} • {instrument.syllabus}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
