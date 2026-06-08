import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, User, Music, Sparkles, ListChecks, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { page, navigate, student } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generate', label: 'Generate', icon: Sparkles },
    { id: 'routine', label: 'Practice', icon: Music },
    { id: 'instruments', label: 'Instruments', icon: ListChecks },
  ];

  const bottomNavItems = [
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const nav = (id: string) => {
    navigate(id as any);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
  };

  const primaryInstrument = student.instruments?.find(i => i.isPrimary) || student.instruments?.[0];

  const content = (
    <div className="px-5 py-6 flex flex-col h-full">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-surface-900">MadJo AI</h1>
            <p className="text-[11px] text-surface-400 font-medium">Music Learning Agent</p>
          </div>
        </div>
        <div className="bg-surface-50 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-r from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              {student.name?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900">{student.name || 'Student'}</p>
              <p className="text-xs text-surface-500">{primaryInstrument?.name || 'Music'} • Grade {primaryInstrument?.gradeLevel || 1}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1">
        <p className="px-3 mb-2 text-[11px] font-semibold text-surface-400 uppercase">Menu</p>
        {mainNavItems.map((item) => {
          const isActive = page === item.id;
          return (
            <button key={item.id} onClick={() => nav(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${isActive ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'}`}>
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-brand-600' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-surface-100">
        {bottomNavItems.map((item) => {
          const isActive = page === item.id;
          return (
            <button key={item.id} onClick={() => nav(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${isActive ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'}`}>
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-brand-600' : ''}`} />
              {item.label}
            </button>
          );
        })}
        <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all mt-2">
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-surface-200/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-surface-900">MadJo AI</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-surface-100">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 z-40 w-72 bg-white border-r border-surface-200/60 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {content}
      </div>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-surface-200/60">
        {content}
      </aside>
    </>
  );
}
