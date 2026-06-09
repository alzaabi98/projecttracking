import { useRef } from 'react'
import { Download, Upload, Database, Trash2 } from 'lucide-react'

export default function Settings({ state, update, exportData, importData, loadSample }) {
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => importData(ev.target.result)
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4 max-w-xl">
      {/* Project settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Settings</h3>
        <div>
          <label className="label">Project Name</label>
          <input className="input" value={state.projectName} onChange={e => update({ projectName: e.target.value })} />
        </div>
        <div>
          <label className="label">Total Budget (OMR)</label>
          <input className="input" type="number" min="0" step="0.01" value={state.budget || ''} onChange={e => update({ budget: parseFloat(e.target.value) || 0 })} placeholder="75000" />
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Data Management</h3>

        <button onClick={exportData} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
          <Download size={17} className="text-indigo-500" /> Export data as JSON
        </button>

        <button onClick={() => fileRef.current.click()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
          <Upload size={17} className="text-emerald-500" /> Import data from JSON
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />

        <button onClick={() => { if (confirm('Load sample data? This will replace current data.')) loadSample() }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
          <Database size={17} className="text-purple-500" /> Load sample project data
        </button>

        <button onClick={() => { if (confirm('Clear all data? This cannot be undone.')) { localStorage.removeItem('cafe-tracker-data'); window.location.reload() } }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium text-red-500">
          <Trash2 size={17} /> Clear all data
        </button>
      </div>
    </div>
  )
}
