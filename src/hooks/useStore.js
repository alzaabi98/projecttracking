import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { SAMPLE_DATA, CHECKLIST_ITEMS, generateId } from '../data/sampleData'

const defaultState = {
  projectName: 'My Cafe Project',
  budget: 0,
  scopes: [],
  checklist: Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.id, false])),
  darkMode: false,
}

// LocalStorage fallback key
const LS_KEY = 'cafe-tracker-data'

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveLocal(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch {}
}

export function useStore(userId) {
  const [state, setState] = useState(() => loadLocal() || { ...defaultState })
  const [syncing, setSyncing] = useState(false)

  // Load from Supabase on mount / user change
  useEffect(() => {
    if (!userId) return
    setSyncing(true)
    supabase
      .from('user_projects')
      .select('data')
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (data?.data) {
          setState(data.data)
          saveLocal(data.data)
        } else if (error?.code === 'PGRST116') {
          // No row yet — push current local state up
          const local = loadLocal() || { ...defaultState }
          supabase.from('user_projects').upsert(
            { user_id: userId, data: local, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
          setState(local)
        }
        setSyncing(false)
      })
  }, [userId])

  // Save to Supabase + LocalStorage whenever state changes
  const persist = useCallback(async (newState) => {
    saveLocal(newState)
    if (!userId) return
    await supabase
      .from('user_projects')
      .upsert(
        { user_id: userId, data: newState, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
  }, [userId])

  const update = (patch) => {
    setState(s => {
      const next = { ...s, ...patch }
      persist(next)
      return next
    })
  }

  const addScope = (scope) => {
    const newScope = { ...scope, id: generateId(), payments: [] }
    setState(s => {
      const next = { ...s, scopes: [...s.scopes, newScope] }
      persist(next)
      return next
    })
  }

  const updateScope = (id, patch) => {
    setState(s => {
      const next = { ...s, scopes: s.scopes.map(sc => sc.id === id ? { ...sc, ...patch } : sc) }
      persist(next)
      return next
    })
  }

  const deleteScope = (id) => {
    setState(s => {
      const next = { ...s, scopes: s.scopes.filter(sc => sc.id !== id) }
      persist(next)
      return next
    })
  }

  const addPayment = (scopeId, payment) => {
    const p = { ...payment, id: generateId() }
    setState(s => {
      const next = {
        ...s,
        scopes: s.scopes.map(sc =>
          sc.id === scopeId ? { ...sc, payments: [...(sc.payments || []), p] } : sc
        ),
      }
      persist(next)
      return next
    })
  }

  const deletePayment = (scopeId, paymentId) => {
    setState(s => {
      const next = {
        ...s,
        scopes: s.scopes.map(sc =>
          sc.id === scopeId
            ? { ...sc, payments: sc.payments.filter(p => p.id !== paymentId) }
            : sc
        ),
      }
      persist(next)
      return next
    })
  }

  const toggleChecklist = (id) => {
    setState(s => {
      const next = { ...s, checklist: { ...s.checklist, [id]: !s.checklist[id] } }
      persist(next)
      return next
    })
  }

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
      persist(data)
    } catch {
      alert('Invalid JSON file')
    }
  }

  const loadSample = () => {
    const data = { ...defaultState, ...SAMPLE_DATA }
    setState(data)
    persist(data)
  }

  const toggleDark = () => {
    setState(s => {
      const next = { ...s, darkMode: !s.darkMode }
      persist(next)
      return next
    })
  }

  return {
    state,
    syncing,
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
