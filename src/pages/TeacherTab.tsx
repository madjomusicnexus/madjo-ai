import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Upload, Sparkles, Send, CheckCircle } from 'lucide-react';
import { callAIWithFallback } from '../lib/ai';

interface LessonNotes {
  covered: string[];
  focusPiece: string;
  tempo: string;
  performance: 'emerging' | 'developing' | 'secure';
  teacherNotes: string;
  studentEmail: string;
  teacherEmail: string;
  parentEmail: string;
}

const coveredOptions = [
  'Scales', 'Repertoire', 'Technique', 'Sight Reading',
  'Ear Training', 'Music Theory', 'Rhythm', 'Expression'
];

export default function TeacherTab() {
  const { student } = useApp();
  const [activeSection, setActiveSection] = useState<1 | 2 | 3>(1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const [notes, setNotes] = useState<LessonNotes>({
    covered: [],
    focusPiece: '',
    tempo: '',
    performance: 'developing',
    teacherNotes: '',
    studentEmail: '',
    teacherEmail: '',
    parentEmail: '',
  });

  const toggleCovered = (item: string) => {
    setNotes((n) => ({
      ...n,
      covered: n.covered.includes(item)
        ? n.covered.filter((c) => c !== item)
        : [...n.covered, item],
    }));
  };

  const handleSendEmails = async () => {
    if (!notes.studentEmail && !notes.teacherEmail && !notes.parentEmail) {
      setError('Please add at least one email address to send to.');
      return;
    }

    setSending(true);
    setError('');

    try {
      const systemPrompt = `You are MadJo AI. Write 3 short emails about a music lesson. Reply only with valid raw JSON, no markdown.`;

      const primaryInstrument = student.instruments?.find(i => i.isPrimary);
      const instrumentName = primaryInstrument?.name || 'Music';
      const gradeLevel = primaryInstrument?.gradeLevel || 1;

      const userPrompt = `Write 3 emails about this music lesson for ${student.name} (${instrumentName}, Grade ${gradeLevel}):
Lesson covered: ${notes.covered.join(', ')}
Focus piece: ${notes.focusPiece}
Tempo worked on: ${notes.tempo} BPM
Performance level: ${notes.performance}
Teacher notes: ${notes.teacherNotes}

Return JSON:
{
  "studentEmail": {
    "subject": "short subject line",
    "body": "encouraging 3-4 sentence email to the student"
  },
  "teacherEmail": {
    "subject": "short subject line", 
    "body": "professional 3-4 sentence confirmation for the teacher"
  },
  "parentEmail": {
    "subject": "short subject line",
    "body": "friendly 3-4 sentence parent-friendly progress update"
  }
}`;

      const text = await callAIWithFallback(
        ['groq', 'claude', 'openai'],
        systemPrompt,
        userPrompt,
        800
      );

      let clean = text.trim();
      if (clean.startsWith('```json')) clean = clean.slice(7);
      else if (clean.startsWith('```')) clean = clean.slice(3);
      if (clean.endsWith('```')) clean = clean.slice(0, -3);
      clean = clean.trim();

      const emails = JSON.parse(clean);

      // Send via Supabase Edge Function
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      await supabase.functions.invoke('send-email', {
        body: {
          recipients: [
            notes.studentEmail && { to: notes.studentEmail, ...emails.studentEmail },
            notes.teacherEmail && { to: notes.teacherEmail, ...emails.teacherEmail },
            notes.parentEmail && { to: notes.parentEmail, ...emails.parentEmail },
          ].filter(Boolean),
        },
      });

      setSent(true);
      setTimeout(() => setSent(false), 4000);

    } catch (err) {
      setError('Failed to send emails. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-surface-900 mb-1">Teacher Tab</h2>
        <p className="text-surface-500">Log lesson details and send progress reports instantly</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2">
        {[
          { num: 1 as const, label: "This Week's Lesson", icon: BookOpen },
          { num: 2 as const, label: 'Performance Upload', icon: Upload },
          { num: 3 as const, label: 'Send Reports', icon: Send },
        ].map(({ num, label, icon: Icon }) => (
          <button
            key={num}
            onClick={() => setActiveSection(num)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === num ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Section 1 — Lesson Notes */}
      {activeSection === 1 && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-brand-700" />
            </div>
            <h3 className="text-xl font-bold text-surface-900">This Week's Lesson</h3>
          </div>

          {/* What was covered */}
          <div>
            <label className="input-label">What was covered in the lesson?</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {coveredOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleCovered(item)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${notes.covered.includes(item) ? 'bg-brand-600 text-white border-brand-600' : 'border-surface-200 text-surface-600 hover:bg-surface-50'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Focus piece */}
          <div>
            <label className="input-label">Focus piece or exercise</label>
            <input
              type="text"
              value={notes.focusPiece}
              onChange={(e) => setNotes({ ...notes, focusPiece: e.target.value })}
              className="input-field"
              placeholder="e.g. Bach Minuet in G, C Major Scale"
            />
          </div>

          {/* Tempo */}
          <div>
            <label className="input-label">Tempo worked on (BPM)</label>
            <input
              type="text"
              value={notes.tempo}
              onChange={(e) => setNotes({ ...notes, tempo: e.target.value })}
              className="input-field"
              placeholder="e.g. 60, 80-100"
            />
          </div>

          {/* Performance rating — MADJO rubric */}
          <div>
            <label className="input-label">Student performance this week</label>
            <div className="flex gap-3 mt-2">
              {(['emerging', 'developing', 'secure'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setNotes({ ...notes, performance: level })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize border transition-all ${notes.performance === level ? 'bg-brand-600 text-white border-brand-600' : 'border-surface-200 text-surface-600 hover:bg-surface-50'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher notes */}
          <div>
            <label className="input-label">Teacher notes</label>
            <textarea
              value={notes.teacherNotes}
              onChange={(e) => setNotes({ ...notes, teacherNotes: e.target.value })}
              className="input-field resize-none"
              rows={4}
              placeholder="e.g. Left hand needs work on bars 12-16. Great improvement on dynamics this week."
            />
          </div>

          <button
            onClick={() => setActiveSection(2)}
            className="btn-primary"
          >
            Next — Performance Upload
          </button>
        </div>
      )}

      {/* Section 2 — Student Performance Upload */}
      {activeSection === 2 && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-brand-700" />
            </div>
            <h3 className="text-xl font-bold text-surface-900">Student Performance</h3>
          </div>

          <p className="text-surface-500 text-sm">Ask the student to record a short clip (max 2 minutes) of their practice and upload it here.</p>

          <div className="border-2 border-dashed border-surface-200 rounded-2xl p-12 text-center hover:border-brand-300 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500 text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-surface-400 text-xs mt-1">Audio or video, max 2 minutes</p>
          </div>

          <div>
            <label className="input-label">Student self-rating</label>
            <div className="flex gap-3 mt-2">
              {['😕 Needs work', '😐 Getting there', '😊 Felt good'].map((rating) => (
                <button
                  key={rating}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-surface-200 text-surface-600 hover:bg-surface-50 transition-all"
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveSection(3)}
            className="btn-primary"
          >
            Next — Send Reports
          </button>
        </div>
      )}

      {/* Section 3 — Send Reports */}
      {activeSection === 3 && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-700" />
            </div>
            <h3 className="text-xl font-bold text-surface-900">Send Progress Reports</h3>
          </div>

          <p className="text-surface-500 text-sm">MadJo AI will write a personalised email for each recipient based on the lesson notes. Each email is tailored — encouraging for the student, professional for the teacher, simple for the parent.</p>

          <div>
            <label className="input-label">Student's email</label>
            <input
              type="email"
              value={notes.studentEmail}
              onChange={(e) => setNotes({ ...notes, studentEmail: e.target.value })}
              className="input-field"
              placeholder="student@email.com"
            />
          </div>

          <div>
            <label className="input-label">Teacher's email</label>
            <input
              type="email"
              value={notes.teacherEmail}
              onChange={(e) => setNotes({ ...notes, teacherEmail: e.target.value })}
              className="input-field"
              placeholder="teacher@email.com"
            />
          </div>

          <div>
            <label className="input-label">Parent's email</label>
            <input
              type="email"
              value={notes.parentEmail}
              onChange={(e) => setNotes({ ...notes, parentEmail: e.target.value })}
              className="input-field"
              placeholder="parent@email.com"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

          {sent && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Emails sent successfully!</span>
            </div>
          )}

          <button
            onClick={handleSendEmails}
            disabled={sending}
            className="btn-primary w-full justify-center"
          >
            <Send className="w-4 h-4" />
            {sending ? 'AI is writing emails...' : 'Send Progress Reports'}
          </button>
        </div>
      )}
    </div>
  );
}