import { useState, useEffect } from 'react'
import { LayoutDashboard, FolderOpen, CheckSquare, Settings as SettingsIcon, Moon, Sun, Coffee } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Scopes from './components/Scopes'
import Checklist from './components/Checklist'
import Settings from './components/Settings'
import { useStore } from './hooks/useStore'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scopes', label: 'Scopes', icon: FolderOpen },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function App() {
  const store = useStore()
  const { state, toggleDark } = store
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!state.darkMode)
  }, [state.darkMode])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Coffee size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">{state.projectName}</h1>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">Cafe Cost Tracker</p>
            </div>
          </div>
          <button onClick={toggleDark} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {state.darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <nav className="hidden sm:flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        <main>
          {tab === 'dashboard' && <Dashboard state={state} />}
          {tab === 'scopes' && <Scopes state={state} {...store} />}
          {tab === 'checklist' && <Checklist checklist={state.checklist} toggleChecklist={store.toggleChecklist} />}
          {tab === 'settings' && <Settings state={state} update={store.update} exportData={store.exportData} importData={store.importData} loadSample={store.loadSample} />}
        </main>
      </div>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex z-30">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
              tab === id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="h-16 sm:hidden" />
    </div>
  )
}
