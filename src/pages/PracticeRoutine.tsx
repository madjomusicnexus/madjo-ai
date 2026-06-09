import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ExerciseCard from '../components/ExerciseCard';
import Metronome from '../components/Metronome';
import { Sparkles, CheckCircle2, ArrowLeft, Lightbulb, Brain, Guitar, Mic, Piano, Drum, Music } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generatePracticeReportHTML, type PracticeReportData } from '../lib/emailReport';
import { getXPData } from '../lib/xpSystem';

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

function generatePracticeInsight(instrument: string, gradeLevel: number, focusArea: string, isSingingWhilePlaying: boolean): string {
  const insights = [
    `Your Grade ${gradeLevel} ${instrument} routine emphasizes ${focusArea.toLowerCase()}. Focus on consistent practice rather than speed.`,
    `For Grade ${gradeLevel} ${instrument}, sight-reading accuracy improves when practiced slowly first.`,
    `Consider slowing down difficult passages before increasing tempo. Precision matters more than speed.`,
    `Your ${instrument} practice sessions will benefit from shorter, focused bursts. Quality over quantity.`,
    `Grade ${gradeLevel} musicians often underestimate ear training. Dedicate extra attention to interval recognition.`,
  ];
  
  if (isSingingWhilePlaying) {
    insights.push(`🎤🎸 Since you're working on singing while playing, try recording yourself to hear the balance.`);
  }

  return insights[Math.floor(Math.random() * insights.length)];
}

function getLevelGroup(gradeLevel: number): string {
  if (gradeLevel <= 2) return 'Foundation';
  if (gradeLevel <= 5) return 'Intermediate';
  return 'Advanced';
}

export default function PracticeRoutine() {
  const { routine, toggleExercise, navigate, student } = useApp();
  const [activeInstrumentTab, setActiveInstrumentTab] = useState<string>('');
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  if (!routine) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-surface-400" />
        </div>
        <h3 className="text-xl font-semibold text-surface-900 mb-2">No Routine Yet</h3>
        <p className="text-surface-500 mb-6 text-center max-w-md">Generate your personalized practice routine powered by AI.</p>
        <button onClick={() => navigate('generate')} className="btn-primary"><Sparkles className="w-4 h-4" /> Generate Routine</button>
      </div>
    );
  }

  // Get all instruments from student profile
  const studentInstruments = student.instruments || [];
  
  // Parse exercises to extract instrument from title (e.g., "[GUITAR] Warm-Up")
  const exercisesByInstrument: Record<string, typeof routine.exercises> = {};
  
  // Initialize empty arrays for each instrument
  studentInstruments.forEach(inst => {
    exercisesByInstrument[inst.name] = [];
  });
  
  // If no instruments in profile, use routine instrument
  if (studentInstruments.length === 0 && routine.instrument) {
    exercisesByInstrument[routine.instrument] = [];
  }
  
  // Sort exercises into their respective instrument buckets
  routine.exercises.forEach(exercise => {
    // Check if exercise title has instrument prefix like "[GUITAR]" or "[VOCALS]"
    const match = exercise.title.match(/^\[([A-Z]+)\]/);
    if (match) {
      const instrumentName = match[1].toLowerCase();
      if (exercisesByInstrument[instrumentName]) {
        exercisesByInstrument[instrumentName].push(exercise);
      } else {
        // If instrument not found, add to first available or create new
        const firstKey = Object.keys(exercisesByInstrument)[0];
        if (firstKey) exercisesByInstrument[firstKey].push(exercise);
      }
    } else {
      // No prefix - add to primary instrument or first one
      const primaryInstrument = studentInstruments.find(i => i.isPrimary)?.name || studentInstruments[0]?.name || routine.instrument;
      if (exercisesByInstrument[primaryInstrument]) {
        exercisesByInstrument[primaryInstrument].push(exercise);
      } else if (Object.keys(exercisesByInstrument).length > 0) {
        exercisesByInstrument[Object.keys(exercisesByInstrument)[0]].push(exercise);
      }
    }
  });

  // Filter out empty instrument groups
  const availableInstruments = Object.keys(exercisesByInstrument).filter(
    inst => exercisesByInstrument[inst].length > 0
  );

  // Set default active tab
  if (!activeInstrumentTab && availableInstruments.length > 0) {
    setActiveInstrumentTab(availableInstruments[0]);
  }

  // Get current exercises for active tab
  const currentExercises = activeInstrumentTab ? exercisesByInstrument[activeInstrumentTab] || [] : [];
  const completedCount = currentExercises.filter((e) => e.completed).length;
  const totalCount = currentExercises.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalDuration = currentExercises.reduce((sum, e) => sum + e.duration, 0);
  const completedDuration = currentExercises.filter((e) => e.completed).reduce((sum, e) => sum + e.duration, 0);

  // Get active instrument details for insight
  const activeInstrumentDetail = studentInstruments.find(i => i.name === activeInstrumentTab);
  const instrumentName = activeInstrumentDetail?.name || activeInstrumentTab || routine.instrument;
  const gradeLevel = activeInstrumentDetail?.gradeLevel || routine.gradeLevel || 1;

  const aiInsight = generatePracticeInsight(
    instrumentName, 
    gradeLevel, 
    routine.focusArea,
    routine.isSingingWhilePlaying || student.singingWhilePlaying || false
  );

  const firstExercise = currentExercises[0];
  const suggestedDifficulty = firstExercise?.difficulty || 'intermediate';
  const suggestedType = firstExercise?.category || 'technique';

   // Check if all exercises across ALL instruments are completed
  const allExercisesCompleted = Object.values(exercisesByInstrument).every(
    exercises => exercises.length > 0 && exercises.every(e => e.completed)
  );
  const totalExercisesCount = Object.values(exercisesByInstrument).reduce(
    (sum, exercises) => sum + exercises.length, 0
  );
  
  console.log('allExercisesCompleted:', allExercisesCompleted);
  console.log('totalExercisesCount:', totalExercisesCount);
  console.log('exercisesByInstrument:', exercisesByInstrument);

  const handleSendReport = async () => {
    if (!student.email) {
      alert('Please add your email address in Profile to receive practice reports.');
      navigate('profile');
      return;
    }

    setIsSendingReport(true);
    
    try {
      const xpData = getXPData();
      const streakHistory = localStorage.getItem('practice_history');
      const streaks = streakHistory ? JSON.parse(streakHistory) : [];
      const completedExercises = routine.exercises.filter(e => e.completed);
      
      // Group by instrument
      const exercisesByInstrumentReport: Record<string, any[]> = {};
      completedExercises.forEach(ex => {
        const match = ex.title.match(/^\[([A-Z]+)\]/);
        let instrumentName = match ? match[1].toLowerCase() : 'music';
        if (!exercisesByInstrumentReport[instrumentName]) {
          exercisesByInstrumentReport[instrumentName] = [];
        }
        exercisesByInstrumentReport[instrumentName].push(ex);
      });
      
      const instrumentsData = Object.entries(exercisesByInstrumentReport).map(([name, exercises]) => ({
        name,
        exercises: exercises.map((ex: any) => ({
          title: ex.title.replace(/^\[[A-Z]+\]\s*/, ''),
          description: ex.description,
          category: ex.category,
          duration: ex.duration,
        }))
      }));
      
      const totalXpEarned = completedExercises.length * 10;
      
      const reportData: PracticeReportData = {
        studentName: student.name,
        studentEmail: student.email,
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        instruments: instrumentsData,
        totalDuration: completedExercises.reduce((sum, ex) => sum + ex.duration, 0),
        totalExercises: completedExercises.length,
        xpEarned: totalXpEarned,
        streakDays: streaks.length,
        level: xpData.level,
        levelTitle: xpData.title,
        xpToNextLevel: xpData.xpToNextLevel,
        singingWhilePlaying: routine.isSingingWhilePlaying || false,
      };
      
      const emailHtml = generatePracticeReportHTML(reportData);
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: student.email,
          subject: `🎵 MadJo AI Practice Report - ${new Date().toLocaleDateString()}`,
          html: emailHtml,
        },
      });
      
      if (error) {
        console.error('Send email error:', error);
        alert('❌ Failed to send report. Please try again.');
      } else {
        setReportSent(true);
        alert('✅ Practice report sent to your email!');
      }
    } catch (err) {
      console.error('Error sending report:', err);
      alert('❌ Failed to send report. Please try again.');
    } finally {
      setIsSendingReport(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('dashboard')} className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-surface-900">Today's Practice</h2>
          <p className="text-surface-500">{routine.focusArea}</p>
        </div>
        <span className="badge-accent"><Sparkles className="w-3 h-3" /> AI Generated</span>
      </div>

      {/* Instrument Tabs */}
      {availableInstruments.length > 1 && (
        <div className="border-b border-surface-200">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {availableInstruments.map((instrument) => {
              const Icon = instrumentIcons[instrument] || Music;
              const isActive = activeInstrumentTab === instrument;
              const instrumentData = studentInstruments.find(i => i.name === instrument);
              const levelGroup = instrumentData ? getLevelGroup(instrumentData.gradeLevel) : '';
              const exerciseCount = exercisesByInstrument[instrument].length;
              
              return (
                <button
                  key={instrument}
                  onClick={() => setActiveInstrumentTab(instrument)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-brand-600 text-white shadow-md' 
                      : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-500'}`} />
                  <span>{instrument.charAt(0).toUpperCase() + instrument.slice(1)}</span>
                  {levelGroup && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-500'
                    }`}>
                      {levelGroup}
                    </span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-600'
                  }`}>
                    {exerciseCount} ex
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Single Instrument Badge */}
      {availableInstruments.length === 1 && (
        <div className="flex items-center gap-2 justify-end">
          <div className="bg-brand-100 rounded-full px-3 py-1 text-xs text-brand-700 font-medium">
            🎵 {availableInstruments[0]} • Grade {studentInstruments.find(i => i.name === availableInstruments[0])?.gradeLevel || routine.gradeLevel} • {getLevelGroup(studentInstruments.find(i => i.name === availableInstruments[0])?.gradeLevel || routine.gradeLevel)}
          </div>
          {routine.isSingingWhilePlaying && (
            <div className="bg-purple-100 rounded-full px-3 py-1 text-xs text-purple-700 font-medium">
              🎤 Singing & Playing Mode
            </div>
          )}
        </div>
      )}

      {/* Multi-Instrument Info Banner */}
      {availableInstruments.length > 1 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-200">
          <p className="text-sm text-purple-700 flex items-center gap-2">
            <span>🎵</span>
            You're practicing {availableInstruments.length} instruments today!
            <span className="text-xs ml-auto">
              {availableInstruments.map(i => `${i}: ${exercisesByInstrument[i].length} ex`).join(' • ')}
            </span>
          </p>
        </div>
      )}

      {/* AI Practice Insight */}
      <div className="card p-6 border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-brand-900">AI Practice Insight</h3>
            </div>
            <p className="text-sm text-surface-700 leading-relaxed">{aiInsight}</p>
          </div>
        </div>
      </div>

      {/* Progress for Current Instrument */}
      {totalCount > 0 && (
        <div className="card p-5">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-surface-900">{completedCount}/{totalCount}</p>
              <p className="text-xs text-surface-500">Exercises</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-surface-900">{completedDuration}/{totalDuration}</p>
              <p className="text-xs text-surface-500">Minutes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-600">{progressPct}%</p>
              <p className="text-xs text-surface-500">Complete</p>
            </div>
          </div>
          <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
            <div className="h-full gradient-brand rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {/* Two Column Layout: Metronome + Exercises */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Exercises for Active Instrument */}
        <div className="lg:col-span-2 space-y-3">
          {currentExercises.length === 0 && activeInstrumentTab && (
            <div className="card p-8 text-center">
              <p className="text-surface-500">No exercises found for {activeInstrumentTab}.</p>
              <p className="text-sm text-surface-400 mt-2">Try generating a new routine.</p>
            </div>
          )}
          {currentExercises.map((ex, i) => (
            <ExerciseCard key={ex.id} exercise={ex} index={i} onToggle={toggleExercise} />
          ))}
        </div>

        {/* Right Column - Metronome & Tools */}
        <div className="space-y-4">
          <Metronome 
            suggestedTempo={120}
            exerciseDifficulty={suggestedDifficulty}
            exerciseType={suggestedType}
          />
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">💡 Practice Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li className="flex items-start gap-2"><span>🎧</span><span>Use the metronome to keep steady tempo</span></li>
              <li className="flex items-start gap-2"><span>🔄</span><span>Start slow, then gradually increase speed</span></li>
              <li className="flex items-start gap-2"><span>✋</span><span>Take a 2-minute break every 15 minutes</span></li>
              <li className="flex items-start gap-2"><span>🎯</span><span>Focus on quality, not quantity</span></li>
            </ul>
          </div>

          {routine.isSingingWhilePlaying && (
            <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
              <h4 className="font-semibold text-purple-800 text-sm mb-2">🎤 Singing & Playing Tip</h4>
              <p className="text-xs text-purple-700">
                Start by playing just the chord roots or basic rhythm while singing. Once comfortable, add more complexity.
              </p>
            </div>
          )}

          {availableInstruments.length > 1 && (
            <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
              <h4 className="font-semibold text-green-800 text-sm mb-2">🔄 Multi-Instrument Tip</h4>
              <p className="text-xs text-green-700">
                Switch between instruments using the tabs above. Take a short break when switching instruments.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Completion Section with Send Report Button */}
      {allExercisesCompleted && totalExercisesCount > 0 && (
        <div className="card p-8 text-center animate-slide-up border-brand-200 bg-brand-50/30">
          <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/20">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-surface-900 mb-1">Routine Complete! 🎉</h3>
          <p className="text-surface-500 mb-4">Great job finishing all {totalExercisesCount} exercises!</p>
          
          {!reportSent ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleSendReport}
                disabled={isSendingReport}
                className="btn-primary"
              >
                {isSendingReport ? '📧 Sending report...' : '📧 Send Report to Email'}
              </button>
              <button 
                onClick={() => navigate('dashboard')} 
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-4">✅ Report sent to your email!</p>
              <button onClick={() => navigate('dashboard')} className="btn-primary">
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}