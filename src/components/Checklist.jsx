import { CheckCircle2, Circle } from 'lucide-react'
import { CHECKLIST_ITEMS } from '../data/sampleData'

export default function Checklist({ checklist, toggleChecklist }) {
  const total = CHECKLIST_ITEMS.length
  const done = CHECKLIST_ITEMS.filter(i => checklist[i.id]).length
  const pct = Math.round((done / total) * 100)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Opening Readiness</h3>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{done} of {total} tasks completed</p>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {CHECKLIST_ITEMS.map((item, i) => {
          const checked = !!checklist[item.id]
          return (
            <button
              key={item.id}
              onClick={() => toggleChecklist(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                i < CHECKLIST_ITEMS.length - 1 ? 'border-b border-gray-50 dark:border-gray-700/50' : ''
              } ${checked ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
            >
              {checked
                ? <CheckCircle2 size={22} className="text-emerald-500 flex-shrink-0" />
                : <Circle size={22} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
              }
              <span className={`text-sm font-medium ${checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                {item.label}
              </span>
              {checked && <span className="ml-auto text-xs text-emerald-500 font-medium">Done</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
