import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { TrendingUp, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#3b82f6','#ec4899','#84cc16','#06b6d4','#a855f7','#64748b','#22c55e']

function fmt(n) {
  return 'OMR ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Dashboard({ state }) {
  const { scopes, budget } = state

  const totalContract = scopes.reduce((a, s) => a + (s.contractValue || 0), 0)
  const totalPaid = scopes.reduce((a, s) => a + (s.payments || []).reduce((b, p) => b + (p.amount || 0), 0), 0)
  const totalRemaining = totalContract - totalPaid
  const avgProgress = scopes.length
    ? Math.round(scopes.reduce((a, s) => a + (s.progress || 0), 0) / scopes.length)
    : 0

  // Category spending
  const byCategory = {}
  scopes.forEach(s => {
    const cat = s.category || 'Other'
    byCategory[cat] = (byCategory[cat] || 0) + (s.contractValue || 0)
  })
  const categoryData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Paid vs Remaining per scope (top 6)
  const barData = [...scopes]
    .sort((a, b) => (b.contractValue || 0) - (a.contractValue || 0))
    .slice(0, 8)
    .map(s => {
      const paid = (s.payments || []).reduce((a, p) => a + (p.amount || 0), 0)
      return { name: s.name.length > 14 ? s.name.slice(0, 12) + '…' : s.name, paid, remaining: (s.contractValue || 0) - paid }
    })

  // Top vendors
  const byVendor = {}
  scopes.forEach(s => {
    if (!s.vendor) return
    byVendor[s.vendor] = (byVendor[s.vendor] || 0) + (s.contractValue || 0)
  })
  const vendorData = Object.entries(byVendor)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const cards = [
    {
      label: 'Total Budget', value: fmt(budget),
      sub: budget > 0 ? `${Math.round((totalContract / budget) * 100)}% allocated` : 'Not set',
      icon: <DollarSign size={20} />, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    },
    {
      label: 'Total Contract Value', value: fmt(totalContract),
      sub: `${scopes.length} scopes`,
      icon: <TrendingUp size={20} />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30',
    },
    {
      label: 'Total Paid', value: fmt(totalPaid),
      sub: `${totalContract > 0 ? Math.round((totalPaid / totalContract) * 100) : 0}% of contract`,
      icon: <CheckCircle size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    {
      label: 'Remaining Balance', value: fmt(totalRemaining),
      sub: `${totalContract > 0 ? Math.round((totalRemaining / totalContract) * 100) : 0}% unpaid`,
      icon: <AlertCircle size={20} />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg ${c.bg} ${c.color}`}>{c.icon}</div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{c.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Project completion */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Completion</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{avgProgress}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Average across all scopes</p>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Spending by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Paid vs Remaining */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Paid vs Remaining (Top Scopes)</h3>
          {barData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend />
                <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="remaining" name="Remaining" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top vendors */}
      {vendorData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Vendors by Contract Value</h3>
          <div className="space-y-3">
            {vendorData.map((v, i) => (
              <div key={v.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{v.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{fmt(v.value)}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(v.value / vendorData[0].value) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
