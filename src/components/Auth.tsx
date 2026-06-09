import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Music, Sparkles, User, GraduationCap, Users } from 'lucide-react';

type Role = 'student' | 'teacher' | 'parent';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
              student_email: studentEmail,
              teacher_email: teacherEmail,
              parent_email: parentEmail,
            }
          }
        });
        if (error) throw error;
        setMessage('Check your email to confirm your account!');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    student: User,
    teacher: GraduationCap,
    parent: Users,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-surface-50 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 gradient-brand rounded-3xl shadow-2xl shadow-brand-700/30 mb-6 ring-4 ring-brand-100/50">
              <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-surface-900 mb-2 font-display">
              MadJo AI
            </h1>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-3">
              Music Learning Agent
            </p>
            <p className="text-surface-500 text-base leading-relaxed max-w-sm mx-auto">
              Personalized AI-powered practice routines for music students
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-surface-200/50 border border-surface-200/60 overflow-hidden">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 bg-surface-50 p-1.5 gap-1.5 mx-4 mt-4 rounded-2xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  isLogin
                    ? 'bg-white text-brand-700 shadow-md'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  !isLogin
                    ? 'bg-white text-brand-700 shadow-md'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                Join MadJo
              </button>
            </div>

            {/* Form */}
            <div className="p-7 space-y-5">
              {/* Role Selector - Only for signup */}
              {!isLogin && (
                <div className="animate-slide-up">
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['student', 'teacher', 'parent'] as Role[]).map((r) => {
                      const Icon = roleIcons[r];
                      return (
                        <button
                          key={r}
                          onClick={() => setRole(r)}
                          className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                            role === r
                              ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                              : 'border-surface-200 text-surface-500 hover:border-surface-300 hover:bg-surface-50'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${role === r ? 'text-brand-600' : ''}`} />
                          <span className="capitalize">{r}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Name - Only for signup */}
              {!isLogin && (
                <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
              )}

              {/* Email */}
              <div className={!isLogin ? 'animate-slide-up' : ''} style={{ animationDelay: '100ms' }}>
                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div className={!isLogin ? 'animate-slide-up' : ''} style={{ animationDelay: '150ms' }}>
                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              {/* Optional email fields based on role - Only for signup */}
              {!isLogin && role === 'student' && (
                <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                      Teacher's Email (optional)
                    </label>
                    <input
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="input-field"
                      placeholder="teacher@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                      Parent's Email (optional)
                    </label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="input-field"
                      placeholder="parent@example.com"
                    />
                  </div>
                </div>
              )}

              {!isLogin && role === 'teacher' && (
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                    Student's Email (optional)
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="input-field"
                    placeholder="student@example.com"
                  />
                </div>
              )}

              {!isLogin && role === 'parent' && (
                <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                      Student's Email (optional)
                    </label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="input-field"
                      placeholder="student@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                      Teacher's Email (optional)
                    </label>
                    <input
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="input-field"
                      placeholder="teacher@example.com"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-slide-up">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl animate-slide-up">
                  <p className="text-sm text-emerald-700 font-medium">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full justify-center text-base py-4"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner" />
                    Please wait...
                  </>
                ) : isLogin ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Enter MadJo AI
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5" />
                    Start Your Journey
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-surface-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setMessage('');
                }}
                className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="py-6 text-center border-t border-surface-100 bg-surface-50/50">
        <p className="text-xs text-surface-400 font-medium">
          Powered by Gemini AI • Supabase • React
        </p>
      </div>
    </div>
  );
}
