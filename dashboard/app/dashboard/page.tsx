'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getUserReports, type ScanReport } from '@/lib/api'
import ScanRow from '@/components/dashboard/ScanRow'
import EmptyState from '@/components/dashboard/EmptyState'
import { PlusCircle, TrendingUp, Activity, Target, Radar, RefreshCw } from 'lucide-react'

function SkeletonRow() { return <div className="h-[72px] rounded-xl skeleton"/> }

function StatCard({ label, value, sub, accent }: { label: string; value: string|number; sub: string; accent: string }) {
  const colors: Record<string, string> = {
    cyan:    'border-cyan-400/20 text-cyan-400',
    emerald: 'border-emerald-400/20 text-emerald-400',
    amber:   'border-amber-400/20 text-amber-400',
    rose:    'border-rose-400/20 text-rose-400',
  }
  return (
    <div className={`rounded-2xl border p-5 bg-[#0a1120] ${colors[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-3">{label}</p>
      <p className={`text-3xl font-bold font-mono leading-none`}>{value}</p>
      <p className="text-xs text-[#7a8fa6] mt-1.5">{sub}</p>
    </div>
  )
}

export default function DashboardPage() {
  const supabase = createClient()
  const [scans, setScans]     = useState<ScanReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const data = await getUserReports(session.user.id, session.access_token)
      setScans(data)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const completed   = scans.filter(s => s.status === 'complete')
  const avgScore    = completed.length ? Math.round(completed.reduce((s, r) => s + r.score, 0) / completed.length) : 0
  const bestScore   = completed.length ? Math.max(...completed.map(r => r.score)) : 0
  const latestScore = completed[0]?.score ?? null

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-['Syne'] text-2xl font-bold text-white mb-1">Overview</h1>
          <p className="text-sm text-[#7a8fa6]">Your GEO visibility at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[rgba(34,211,238,0.15)] text-[#7a8fa6] hover:text-white text-sm transition-all disabled:opacity-40">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>
            Refresh
          </button>
          <Link href="/dashboard/scan"
            className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#060b14] font-bold px-4 py-2 rounded-xl text-sm transition-all">
            <PlusCircle size={15}/> New Scan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-up delay-100"><StatCard label="Total Scans"  value={loading ? '—' : scans.length}                                 sub="all time"                                        accent="cyan"/></div>
        <div className="animate-fade-up delay-150"><StatCard label="Avg Score"    value={loading ? '—' : completed.length ? avgScore : '—'}            sub={completed.length ? `${completed.length} complete` : 'no data'} accent="emerald"/></div>
        <div className="animate-fade-up delay-200"><StatCard label="Best Score"   value={loading ? '—' : bestScore || '—'}                             sub="highest recorded"                                accent="amber"/></div>
        <div className="animate-fade-up delay-300"><StatCard label="Latest"       value={loading ? '—' : latestScore ?? '—'}                           sub={completed[0]?.target_brand ?? 'run a scan first'} accent="rose"/></div>
      </div>

      <div className="animate-fade-up delay-400">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Syne'] text-base font-bold text-white">Scan History</h2>
          {scans.length > 0 && <span className="text-xs text-[#7a8fa6] font-mono">{scans.length} total</span>}
        </div>
        {error && (
          <div className="bg-rose-400/10 border border-rose-400/20 rounded-xl px-5 py-4 text-sm text-rose-400 mb-4 flex items-center justify-between gap-4">
            <span>⚠ {error}</span>
            <button onClick={load} className="shrink-0 underline hover:no-underline">retry</button>
          </div>
        )}
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonRow key={i}/>)}</div>
        ) : scans.length === 0 ? (
          <EmptyState/>
        ) : (
          <div className="space-y-2.5">{scans.map(s => <ScanRow key={s.id} scan={s}/>)}</div>
        )}
      </div>
    </div>
  )
}
