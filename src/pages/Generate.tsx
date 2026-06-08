import { useApp } from '../context/AppContext';
import { Sparkles, Wand2, Music, Target, Clock, Zap, ArrowRight, Loader2, AlertCircle, Brain, Ear } from 'lucide-react';
import { useState, useEffect } from 'react';
import InstrumentSelector from '../components/InstrumentSelector';

export default function Generate() {
  const { student, isGenerating, generateError, generateRoutine, navigate } = useApp();
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
  const [loadingStage, setLoadingStage] = useState(0);
  const [includeAllInstruments, setIncludeAllInstruments] = useState(false);

  const loadingStages = [
    { text: "Analyzing your practice goals...", icon: Brain },
    { text: "Building exercises...", icon: Zap },
    { text: "Optimizing difficulty levels...", icon: Target },
    { text: "Generating ear training...", icon: Ear },
    { text: "Crafting your routine...", icon: Music },
  ];

  // Set default selected instrument when instruments load
  useEffect(() => {
    if (student.instruments && student.instruments.length > 0 && !selectedInstrumentId) {
      const primary = student.instruments.find(i => i.isPrimary);
      setSelectedInstrumentId(primary?.id || student.instruments[0].id);
    }
  }, [student.instruments, selectedInstrumentId]);

  useEffect(() => {
    if (isGenerating) {
      setLoadingStage(0);
      const interval = setInterval(() => {
        setLoadingStage((prev) => (prev + 1) % loadingStages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isGenerating, loadingStages.length]);

  const selectedInstrument = student.instruments?.find(i => i.id === selectedInstrumentId);
  const instrumentName = selectedInstrument?.name || student.instruments?.[0]?.name || 'instrument';
  const hasMultipleInstruments = (student.instruments?.length || 0) > 1;

  const handleGenerate = () => {
    if (selectedInstrument) {
      localStorage.setItem('selected_instrument_id', selectedInstrumentId);
      localStorage.setItem('include_all_instruments', includeAllInstruments ? 'true' : 'false');
      generateRoutine();
    }
  };

  // Show loading while instruments are being fetched
  if (!student.instruments) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="card p-8">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-surface-500">Loading your instruments...</p>
        </div>
      </div>
    );
  }

  // Show message if no instruments
  if (student.instruments.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="card p-8">
          <Music className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Instruments Added</h2>
          <p className="text-surface-500 mb-6">Please go to your profile and add at least one instrument first.</p>
          <button onClick={() => navigate('profile')} className="btn-primary">
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  // Get level group name
  const getLevelGroup = (gradeLevel: number) => {
    if (gradeLevel <= 2) return { name: 'Foundation', color: 'green', grades: 'Grades 1-2' };
    if (gradeLevel <= 5) return { name: 'Intermediate', color: 'blue', grades: 'Grades 3-5' };
    return { name: 'Advanced', color: 'purple', grades: 'Grades 6-8' };
  };

  const levelInfo = selectedInstrument ? getLevelGroup(selectedInstrument.gradeLevel) : { name: '', color: '', grades: '' };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-700/30 ring-4 ring-brand-50">
          <Wand2 className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-surface-900 mb-3">AI Practice Generator</h2>
        <p className="text-surface-500 max-w-lg mx-auto text-lg leading-relaxed">
          Powered by Gemini AI, we'll create a personalized daily practice routine tailored to your instrument and level.
        </p>
      </div>

      {/* Instrument Selector */}
      <div className="card p-8">
        <h3 className="section-title mb-5">Select Instrument</h3>
        <InstrumentSelector 
          instruments={student.instruments}
          selectedInstrumentId={selectedInstrumentId}
          onSelect={setSelectedInstrumentId}
        />
        
        {/* Multi-instrument toggle */}
        {hasMultipleInstruments && (
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAllInstruments}
                onChange={(e) => setIncludeAllInstruments(e.target.checked)}
                className="w-5 h-5 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-surface-700">
                🎸 Include all instruments in this practice session
              </span>
            </label>
            {includeAllInstruments && (
              <p className="text-xs text-brand-600 mt-2 ml-7">
                You'll get exercises for all {student.instruments.length} instruments, balanced by level.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Config summary */}
      <div className="card p-8">
        <h3 className="section-title mb-5">Your Configuration</h3>
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="p-5 bg-gradient-to-br from-brand-50 to-brand-100/30 rounded-2xl text-center border border-brand-100">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Music className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Instrument</p>
            <p className="font-bold text-surface-900">{instrumentName}</p>
            {selectedInstrument && (
              <p className="text-xs text-surface-500 mt-1">Grade {selectedInstrument.gradeLevel}</p>
            )}
          </div>
          <div className="p-5 bg-gradient-to-br from-accent-50 to-accent-100/30 rounded-2xl text-center border border-accent-100">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Level Group</p>
            <p className={`font-bold text-${levelInfo.color}-700`}>{levelInfo.name}</p>
            <p className="text-xs text-surface-500 mt-1">{levelInfo.grades}</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-surface-50 to-surface-100/30 rounded-2xl text-center border border-surface-200">
            <div className="w-12 h-12 bg-gradient-to-br from-surface-400 to-surface-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Practice Goal</p>
            <p className="font-bold text-surface-900">{student.dailyPracticeGoal} min</p>
          </div>
        </div>
        
        {/* Instrument Details */}
        {selectedInstrument && (
          <div className="mt-5 p-4 bg-surface-50 rounded-xl">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-surface-500">Syllabus:</span>
                <span className="ml-2 font-medium">{selectedInstrument.syllabus}</span>
              </div>
              <div>
                <span className="text-surface-500">Genre:</span>
                <span className="ml-2 font-medium">{selectedInstrument.genre}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Multi-instrument preview */}
        {includeAllInstruments && hasMultipleInstruments && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-purple-800 text-sm mb-2">🎵 Multi-Instrument Practice Plan</h4>
            <div className="space-y-2">
              {student.instruments.map(inst => {
                const instLevel = getLevelGroup(inst.gradeLevel);
                return (
                  <div key={inst.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-purple-700">{inst.name}</span>
                    <span className={`text-xs text-${instLevel.color}-600`}>Grade {inst.gradeLevel} • {instLevel.name}</span>
                    <span className="text-xs text-surface-500">{Math.round(student.dailyPracticeGoal / student.instruments.length)} min</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-purple-600 mt-3">
              Each instrument gets focused time based on your {student.dailyPracticeGoal} minute goal.
            </p>
          </div>
        )}

        {/* Singing & Playing Info */}
        {student.singingWhilePlaying && selectedInstrument?.name === 'vocals' && (
          <div className="mt-4 bg-purple-50 rounded-xl p-3 border border-purple-200">
            <p className="text-sm text-purple-700">🎤 Singing mode active - includes vocal warm-ups and breathing exercises</p>
          </div>
        )}
        
        {student.singingWhilePlaying && selectedInstrument?.name !== 'vocals' && (
          <div className="mt-4 bg-purple-50 rounded-xl p-3 border border-purple-200">
            <p className="text-sm text-purple-700">🎤🎸 Singing & Playing mode active - includes coordination exercises with {selectedInstrument?.name}</p>
          </div>
        )}
      </div>

      {/* What you'll get */}
      <div className="card p-8">
        <h3 className="section-title mb-5">What You'll Get</h3>
        <div className="space-y-3">
          {[
            { icon: Zap, title: 'Warm-Up Exercises', desc: 'Finger independence and muscle preparation drills', gradient: 'from-amber-400 to-amber-600' },
            { icon: Target, title: 'Technique & Scales', desc: 'Grade-appropriate scales, arpeggios, and technical work', gradient: 'from-brand-400 to-brand-600' },
            { icon: Music, title: 'Repertoire Practice', desc: 'Focused work on your current pieces with specific measures', gradient: 'from-rose-400 to-rose-600' },
            { icon: Sparkles, title: 'Ear Training & Theory', desc: 'Interval recognition, rhythm work, and key signature review', gradient: 'from-sky-400 to-sky-600' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 p-4 rounded-2xl hover:bg-brand-50/50 transition-all duration-300 border border-transparent hover:border-brand-100 group"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="pt-0.5">
                <p className="font-bold text-surface-800">{item.title}</p>
                <p className="text-sm text-surface-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {generateError && (
        <div className="card p-6 border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="font-bold text-red-800">Generation Issue</p>
              <p className="text-sm text-red-600 mt-1">{generateError}</p>
            </div>
          </div>
          <button onClick={handleGenerate} className="btn-secondary mt-4 text-sm w-full">
            Try Again
          </button>
        </div>
      )}

      {/* Generate button */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-primary text-lg px-10 py-4 shadow-2xl shadow-brand-700/30"
        >
          {isGenerating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating with Gemini AI...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Today's Routine <ArrowRight className="w-5 h-5" /></>
          )}
        </button>

        {isGenerating && (
          <div className="mt-8 animate-fade-in">
            <div className="card p-7 max-w-md mx-auto shadow-xl">
              <div className="space-y-3 mb-5">
                {loadingStages.map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isActive = index === loadingStage;
                  const isPast = index < loadingStage;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 transition-all duration-500 ${
                        isActive ? 'opacity-100 transform translate-x-0' : isPast ? 'opacity-40' : 'opacity-20'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'gradient-brand shadow-md' : isPast ? 'bg-brand-200' : 'bg-surface-200'
                      }`}>
                        <StageIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-surface-400'}`} />
                      </div>
                      <p className={`text-sm font-medium transition-all duration-300 ${
                        isActive ? 'text-brand-700' : 'text-surface-500'
                      }`}>
                        {stage.text}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full gradient-brand rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${((loadingStage + 1) / loadingStages.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-surface-400 mt-3 text-center font-medium">
                Gemini AI is personalizing your routine...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}