import { useState } from 'react';
import { useApp } from '../context/AppContext';
import InstrumentManager from '../components/InstrumentManager';
import { Save, User, Music, Target, Calendar, Award, BookOpen, Heart, Mail } from 'lucide-react';

const syllabusOptions = [
  { value: 'abrsm', label: 'ABRSM (Classical)' },
  { value: 'trinity', label: 'Trinity College London' },
  { value: 'rockschool', label: 'RSL Rockschool' },
  { value: 'trinity-rock-pop', label: 'Trinity Rock & Pop' },
  { value: 'berklee', label: 'Berklee Method' },
  { value: 'jazz', label: 'Jazz Standards' },
  { value: 'blues', label: 'Blues' },
  { value: 'custom', label: 'Custom / Mixed' },
];

const genreOptions = [
  { value: 'classical', label: 'Classical' },
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'blues', label: 'Blues' },
  { value: 'metal', label: 'Metal' },
  { value: 'funk', label: 'Funk / R&B' },
  { value: 'folk', label: 'Folk / Acoustic' },
];

const focusAreaOptions = [
  'Technique',
  'Repertoire',
  'Improvisation',
  'Sight-Reading',
  'Ear-Training',
  'Music Theory',
  'Rhythm',
  'Songwriting',
  'Scales',
  'Arpeggios',
];

export default function Profile() {
  const { student, updateProfile, routine } = useApp();
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email || '');
  const [dailyGoal, setDailyGoal] = useState(student.dailyPracticeGoal);
  const [syllabus, setSyllabus] = useState(student.syllabus || 'abrsm');
  const [genre, setGenre] = useState(student.genre || 'classical');
  const [focusAreas, setFocusAreas] = useState<string[]>(student.focusAreas || []);
  const [instruments, setInstruments] = useState(student.instruments || []);
  const [singingWhilePlaying, setSingingWhilePlaying] = useState(student.singingWhilePlaying || false);
  const [saved, setSaved] = useState(false);

  // Get REAL stats from practice data
  const getRealStats = () => {
    const streakData = localStorage.getItem('practice_history');
    const streaks = streakData ? JSON.parse(streakData) : [];
    
    const xpData = localStorage.getItem('xp_data');
    const xp = xpData ? JSON.parse(xpData) : { totalXP: 0, level: 1 };
    
    const progressData = localStorage.getItem('daily_progress');
    const progress = progressData ? JSON.parse(progressData) : [];
    
    const totalExercises = progress.reduce((sum: number, p: any) => sum + (p.exercisesCompleted || 0), 0);
    const totalPracticeMinutes = progress.reduce((sum: number, p: any) => sum + (p.exercisesCompleted * 5 || 0), 0);
    
    // Calculate grade progress based on XP
    const gradeProgress = Math.min(100, Math.floor((xp.totalXP / 1000) * 100));
    
    return {
      streak: streaks.length,
      totalXP: xp.totalXP,
      level: xp.level,
      totalExercises,
      totalPracticeMinutes,
      gradeProgress
    };
  };

  const stats = getRealStats();
  const completedCount = routine?.exercises.filter((e) => e.completed).length ?? 0;
  const totalCount = routine?.exercises.length ?? 0;
  const todayProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSave = () => {
    updateProfile({
      name,
      email,
      instruments,
      dailyPracticeGoal: dailyGoal,
      syllabus: syllabus as any,
      genre: genre as any,
      focusAreas,
      singingWhilePlaying,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter(a => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const primaryInstrument = instruments.find(i => i.isPrimary);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-surface-900 mb-1">Profile</h2>
        <p className="text-surface-500">Manage your practice profile and goals</p>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 text-brand-600" />
          </div>
          <p className="text-2xl font-bold text-surface-900">{stats.level}</p>
          <p className="text-xs text-surface-500">Current Level</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-accent-600" />
          </div>
          <p className="text-2xl font-bold text-surface-900">{stats.totalXP}</p>
          <p className="text-xs text-surface-500">Total XP</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-surface-900">{stats.streak}</p>
          <p className="text-xs text-surface-500">Day Streak</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Music className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-surface-900">{stats.totalExercises}</p>
          <p className="text-xs text-surface-500">Total Exercises</p>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="card p-6">
        <h3 className="font-bold text-surface-900 mb-3">Today's Progress</h3>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-surface-600">Today's routine</span>
          <span className="text-brand-600 font-semibold">{todayProgress}%</span>
        </div>
        <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
          <div className="h-full gradient-brand rounded-full transition-all duration-500" style={{ width: `${todayProgress}%` }} />
        </div>
        <p className="text-xs text-surface-400 mt-2">
          {completedCount} of {totalCount} exercises completed today
        </p>
      </div>

      {/* Edit Profile Form */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-surface-900">Edit Profile</h3>
        </div>

        <div>
          <label className="input-label">Student Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Enter student name"
          />
        </div>

        <div>
          <label className="input-label flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email Address (for practice reports)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="student@example.com"
          />
          <p className="text-xs text-surface-400 mt-1">Receive daily practice summaries via email</p>
        </div>

        {/* NEW: Instrument Manager - Multi-instrument support */}
        <InstrumentManager 
          instruments={instruments}
          onUpdate={setInstruments}
          singingWhilePlaying={singingWhilePlaying}
          onToggleSingingWhilePlaying={setSingingWhilePlaying}
        />

        {/* Syllabus Selection */}
        <div>
          <label className="input-label flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Teaching Syllabus / Method
          </label>
          <select
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value as any)}
            className="input-field"
          >
            {syllabusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Genre Selection */}
        <div>
          <label className="input-label flex items-center gap-2">
            <Heart className="w-4 h-4" /> Primary Genre
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as any)}
            className="input-field"
          >
            {genreOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Focus Areas */}
        <div>
          <label className="input-label">Focus Areas (select all that apply)</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {focusAreaOptions.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleFocusArea(area)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  focusAreas.includes(area) 
                    ? 'bg-brand-600 text-white shadow-sm' 
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="input-label">Daily Practice Goal (minutes)</label>
          <input
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value) || 30)}
            className="input-field"
            min={5}
            max={120}
            step={5}
          />
        </div>

        {saved && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
            <Save className="w-4 h-4" />
            Profile saved successfully!
          </div>
        )}

        <button onClick={handleSave} className="btn-primary w-full justify-center">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Practice Summary */}
      <div className="card p-6">
        <h3 className="font-bold text-surface-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-600" />
          Practice Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Grade Progress</span>
            <span className="text-surface-700 font-medium">{stats.gradeProgress}%</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.gradeProgress}%` }} />
          </div>
          
          <div className="flex justify-between text-sm mt-3">
            <span className="text-surface-500">Total Practice Time</span>
            <span className="text-surface-700 font-medium">{stats.totalPracticeMinutes} minutes</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Completion Rate (30 days)</span>
            <span className="text-surface-700 font-medium">
              {Math.round((stats.streak / 30) * 100)}%
            </span>
          </div>

          {/* Display Current Settings */}
          <div className="pt-3 mt-2 border-t border-surface-200">
            <p className="text-xs text-surface-500">
              <span className="font-medium">Email:</span> {email || 'Not set'}
            </p>
            <p className="text-xs text-surface-500 mt-1">
              <span className="font-medium">Syllabus:</span> {syllabusOptions.find(s => s.value === syllabus)?.label}
            </p>
            <p className="text-xs text-surface-500 mt-1">
              <span className="font-medium">Genre:</span> {genreOptions.find(g => g.value === genre)?.label}
            </p>
            {focusAreas.length > 0 && (
              <p className="text-xs text-surface-500 mt-1">
                <span className="font-medium">Focus:</span> {focusAreas.join(', ')}
              </p>
            )}
            {primaryInstrument && (
              <p className="text-xs text-surface-500 mt-1">
                <span className="font-medium">Primary Instrument:</span> {primaryInstrument.name} (Grade {primaryInstrument.gradeLevel})
              </p>
            )}
            {singingWhilePlaying && (
              <p className="text-xs text-purple-600 mt-1">
                🎤 Singing & Playing mode enabled - coordination exercises included
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}