import { useState } from 'react'
import { Plus, Pencil, Trash2, CreditCard, Search, ChevronUp, ChevronDown } from 'lucide-react'
import ScopeModal from './ScopeModal'
import PaymentModal from './PaymentModal'
import { STATUS_COLORS, CATEGORIES } from '../data/sampleData'

function fmt(n) {
  return 'OMR ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const PROGRESS_COLOR = (p) => p === 100 ? 'bg-emerald-500' : p >= 50 ? 'bg-indigo-500' : 'bg-amber-400'

export default function Scopes({ state, addScope, updateScope, deleteScope, addPayment, deletePayment }) {
  const { scopes } = state
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [paying, setPaying] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterVendor, setFilterVendor] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const vendors = [...new Set(scopes.map(s => s.vendor).filter(Boolean))]

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const filtered = scopes
    .filter(s => {
      const q = search.toLowerCase()
      return (
        (!q || s.name.toLowerCase().includes(q) || (s.vendor || '').toLowerCase().includes(q)) &&
        (!filterCat || s.category === filterCat) &&
        (!filterVendor || s.vendor === filterVendor)
      )
    })
    .sort((a, b) => {
      let av, bv
      if (sortBy === 'name') { av = a.name; bv = b.name }
      else if (sortBy === 'contract') { av = a.contractValue || 0; bv = b.contractValue || 0 }
      else if (sortBy === 'paid') {
        av = (a.payments || []).reduce((x, p) => x + p.amount, 0)
        bv = (b.payments || []).reduce((x, p) => x + p.amount, 0)
      } else if (sortBy === 'remaining') {
        const paidA = (a.payments || []).reduce((x, p) => x + p.amount, 0)
        const paidB = (b.payments || []).reduce((x, p) => x + p.amount, 0)
        av = (a.contractValue || 0) - paidA
        bv = (b.contractValue || 0) - paidB
      } else if (sortBy === 'progress') { av = a.progress || 0; bv = b.progress || 0 }
      else { av = a.status; bv = b.status }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={12} className="text-gray-300" />
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const handleSave = (form) => {
    if (editing) { updateScope(editing.id, form); setEditing(null) }
    else { addScope(form); setShowAdd(false) }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search scopes or vendors…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-44" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input sm:w-44" value={filterVendor} onChange={e => setFilterVendor(e.target.value)}>
          <option value="">All Vendors</option>
          {vendors.map(v => <option key={v}>{v}</option>)}
        </select>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Add Scope
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                {[
                  { key: 'name', label: 'Scope' },
                  { key: 'status', label: 'Status' },
                  { key: 'progress', label: 'Progress' },
                  { key: 'contract', label: 'Contract' },
                  { key: 'paid', label: 'Paid' },
                  { key: 'remaining', label: 'Remaining' },
                ].map(col => (
                  <th key={col.key}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap"
                    onClick={() => handleSort(col.key)}>
                    <span className="flex items-center gap-1">{col.label}<SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500">No scopes yet. Add one to get started.</td></tr>
              )}
              {filtered.map(scope => {
                const paid = (scope.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
                const remaining = (scope.contractValue || 0) - paid
                const isDelayed = scope.status === 'Delayed'
                return (
                  <tr key={scope.id} className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors ${isDelayed ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{scope.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{scope.category} · {scope.vendor || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[scope.status] || ''}`}>
                        {scope.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${PROGRESS_COLOR(scope.progress || 0)}`} style={{ width: `${scope.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{scope.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{fmt(scope.contractValue)}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">{fmt(paid)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={remaining > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-emerald-600 dark:text-emerald-400'}>{fmt(remaining)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPaying(scope)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" title="Payments">
                          <CreditCard size={15} />
                        </button>
                        <button onClick={() => setEditing(scope)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => { if (confirm('Delete this scope?')) deleteScope(scope.id) }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(showAdd || editing) && (
        <ScopeModal
          scope={editing}
          onSave={handleSave}
          onClose={() => { setShowAdd(false); setEditing(null) }}
        />
      )}
      {paying && (
        <PaymentModal
          scope={paying}
          onAddPayment={(sid, p) => { addPayment(sid, p); setPaying(s => ({ ...s, payments: [...(s.payments || []), p] })) }}
          onDeletePayment={(sid, pid) => { deletePayment(sid, pid); setPaying(s => ({ ...s, payments: s.payments.filter(p => p.id !== pid) })) }}
          onClose={() => setPaying(null)}
        />
      )}
    </div>
  )
}
