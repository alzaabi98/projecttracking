import { useState, useEffect } from 'react'
import { SAMPLE_DATA, CHECKLIST_ITEMS, generateId } from '../data/sampleData'

const STORAGE_KEY = 'cafe-tracker-data'

const defaultState = {
  projectName: 'My Cafe Project',
  budget: 0,
  scopes: [],
  checklist: Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.id, false])),
  darkMode: false,
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function useStore() {
  const [state, setState] = useState(() => load() || { ...defaultState })

  useEffect(() => {
    save(state)
  }, [state])

  const update = (patch) => setState(s => ({ ...s, ...patch }))

  // Scopes
  const addScope = (scope) => {
    const newScope = { ...scope, id: generateId(), payments: [] }
    setState(s => ({ ...s, scopes: [...s.scopes, newScope] }))
  }

  const updateScope = (id, patch) => {
    setState(s => ({
      ...s,
      scopes: s.scopes.map(sc => sc.id === id ? { ...sc, ...patch } : sc),
    }))
  }

  const deleteScope = (id) => {
    setState(s => ({ ...s, scopes: s.scopes.filter(sc => sc.id !== id) }))
  }

  // Payments
  const addPayment = (scopeId, payment) => {
    const p = { ...payment, id: generateId() }
    setState(s => ({
      ...s,
      scopes: s.scopes.map(sc =>
        sc.id === scopeId ? { ...sc, payments: [...(sc.payments || []), p] } : sc
      ),
    }))
  }

  const deletePayment = (scopeId, paymentId) => {
    setState(s => ({
      ...s,
      scopes: s.scopes.map(sc =>
        sc.id === scopeId
          ? { ...sc, payments: sc.payments.filter(p => p.id !== paymentId) }
          : sc
      ),
    }))
  }

  // Checklist
  const toggleChecklist = (id) => {
    setState(s => ({ ...s, checklist: { ...s.checklist, [id]: !s.checklist[id] } }))
  }

  // Import / Export
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cafe-tracker-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (json) => {
    try {
      const data = JSON.parse(json)
      setState(data)
    } catch {
      alert('Invalid JSON file')
    }
  }

  const loadSample = () => setState({ ...defaultState, ...SAMPLE_DATA })

  const toggleDark = () => setState(s => ({ ...s, darkMode: !s.darkMode }))

  return {
    state,
    update,
    addScope,
    updateScope,
    deleteScope,
    addPayment,
    deletePayment,
    toggleChecklist,
    exportData,
    importData,
    loadSample,
    toggleDark,
  }
}
