import { useState } from 'react'
import { X, Trash2, Plus } from 'lucide-react'

function fmt(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

export default function PaymentModal({ scope, onAddPayment, onDeletePayment, onClose }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: '', note: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const payments = scope.payments || []
  const totalPaid = payments.reduce((a, p) => a + (p.amount || 0), 0)
  const remaining = (scope.contractValue || 0) - totalPaid

  const handleAdd = (e) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) return
    onAddPayment(scope.id, { date: form.date, amount, note: form.note })
    setForm(f => ({ ...f, amount: '', note: '' }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{scope.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Payments — {scope.vendor}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Contract</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">OMR {fmt(scope.contractValue)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3">
              <p className="text-xs text-emerald-500 mb-1">Paid</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">OMR {fmt(totalPaid)}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3">
              <p className="text-xs text-amber-500 mb-1">Balance</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">OMR {fmt(remaining)}</p>
            </div>
          </div>

          {/* Payment list */}
          {payments.length > 0 && (
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">OMR {fmt(p.amount)}</p>
                    <p className="text-xs text-gray-400">{p.date}{p.note ? ` — ${p.note}` : ''}</p>
                  </div>
                  <button onClick={() => onDeletePayment(scope.id, p.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add payment */}
          <form onSubmit={handleAdd} className="border border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><Plus size={14} /> Add Payment</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div>
                <label className="label">Amount (OMR)</label>
                <input className="input" type="number" min="0" step="0.001" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.000" required />
              </div>
              <div className="col-span-2">
                <label className="label">Note (optional)</label>
                <input className="input" value={form.note} onChange={e => set('note', e.target.value)} placeholder="e.g. First installment" />
              </div>
            </div>
            <button type="submit" className="w-full btn-primary text-sm py-2">Add Payment</button>
          </form>
        </div>
      </div>
    </div>
  )
}
