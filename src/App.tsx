import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import Auth from './components/Auth'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Instruments from './pages/Instruments'
import PracticeRoutine from './pages/PracticeRoutine'
import Generate from './pages/Generate'

function AppContent() {
  const { page } = useApp()
  const pages: Record<string, React.ComponentType> = {
    dashboard: Dashboard,
    profile: Profile,
    instruments: Instruments,
    routine: PracticeRoutine,
    generate: Generate,
  }
  const Page = pages[page] || Dashboard

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Sidebar />
      <main className="lg:ml-64 flex-1">
        <div className="pt-16 lg:pt-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl">
          <Page />
        </div>
      </main>
      <footer className="lg:ml-64 py-4 px-6 border-t border-surface-200 bg-white/50 backdrop-blur-sm">
        <p className="text-xs text-surface-400 text-center font-medium">
          Powered by Groq AI • Supabase • MADJO
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen bg-surface-50 flex items-center justify-center"><p>Loading...</p></div>
  if (!session) return <Auth />
  
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
