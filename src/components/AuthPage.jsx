import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Coffee, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'error'|'success', text }

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Account created! Check your email to confirm, then log in.' })
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Password reset email sent. Check your inbox.' })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
            <Coffee size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cafe Cost Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">Track your construction project costs</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
            {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Create an account' : 'Reset password'}
          </h2>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
              message.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('signup'); setMessage(null) }} className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium block w-full">
                  Don't have an account? Sign up
                </button>
                <button onClick={() => { setMode('reset'); setMessage(null) }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 block w-full">
                  Forgot password?
                </button>
              </>
            )}
            {mode !== 'login' && (
              <button onClick={() => { setMode('login'); setMessage(null) }} className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
