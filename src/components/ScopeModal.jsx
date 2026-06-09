import { useState } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES, STATUSES } from '../data/sampleData'

const empty = {
  name: '', category: 'Flooring', vendor: '', contractValue: '',
  progress: 0, status: 'Not Started', notes: '',
}

export default function ScopeModal({ scope, onSave, onClose }) {
  const [form, setForm] = useState(scope ? { ...scope, contractValue: scope.contractValue ?? '' } : { ...empty })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, contractValue: parseFloat(form.contractValue) || 0, progress: parseInt(form.progress) || 0 })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {scope ? 'Edit Scope' : 'Add Scope'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Scope Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Flooring Works" required />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Vendor</label>
              <input className="input" value={form.vendor} onChange={e => set('vendor', e.target.value)} placeholder="Vendor name" />
            </div>
            <div>
              <label className="label">Contract Value (OMR)</label>
              <input className="input" type="number" min="0" step="0.01" value={form.contractValue} onChange={e => set('contractValue', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Progress: {form.progress}%</label>
              <input type="range" min="0" max="100" value={form.progress} onChange={e => set('progress', e.target.value)}
                className="w-full accent-indigo-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" className="flex-1 btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
