'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Loader2, Zap, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [done, setDone]       = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) } else setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-[#060b14] bg-grid flex items-center justify-center p-4">
      <div className="text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400"/>
        </div>
        <h2 className="font-['Syne'] text-2xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-[#7a8fa6] text-sm">Confirmation sent to <span className="text-white">{email}</span></p>
        <Link href="/auth/login" className="inline-block mt-8 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">← Back to sign in</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#060b14] bg-grid flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"/>
      <div className="relative w-full max-w-md animate-fade-up">
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center"><Zap className="w-4 h-4 text-cyan-400"/></div>
          <span className="font-['Syne'] text-xl font-bold tracking-tight text-white">Visora</span>
        </div>
        <div className="bg-[#0a1120] border border-[rgba(34,211,238,0.1)] rounded-2xl p-8">
          <h1 className="font-['Syne'] text-2xl font-bold text-white mb-1">Start free</h1>
          <p className="text-[#7a8fa6] text-sm mb-8">1 website · 1 free scan/month. No credit card.</p>
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full bg-[#0f1b30] border border-[rgba(34,211,238,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3d5166] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"/>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Minimum 8 characters"
                  className="w-full bg-[#0f1b30] border border-[rgba(34,211,238,0.12)] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-[#3d5166] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"/>
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d5166] hover:text-[#7a8fa6] transition-colors">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            {error && <div className="bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3 text-sm text-rose-400">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-[#060b14] font-bold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 size={15} className="animate-spin"/>}
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>
          <p className="text-center text-sm text-[#7a8fa6] mt-6">Already have an account? <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
