'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getUserReports, scoreColor, type ScanReport } from '@/lib/api'
import ScanRow from '@/components/dashboard/ScanRow'
import EmptyState from '@/components/dashboard/EmptyState'
import { PlusCircle, TrendingUp, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatDate } from '@/lib/utils'

function SkeletonRow() { return <div className="h-[72px] rounded-xl skeleton"/> }

const BRAND_COLORS = ['#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#a78bfa']

function TrendChart({ scans }: { scans: ScanReport[] }) {
  // Group by brand, sort by date asc, keep last 10 per brand
  const grouped: Record<string, { date: string; score: number }[]> = {}
  ;[...scans].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .forEach(s => {
      if (!grouped[s.target_brand]) grouped[s.target_brand] = []
      grouped[s.target_brand].push({
        date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: s.score,
      })
    })

  const brands = Object.keys(grouped)
  const hasTrend = brands.some(b => grouped[b].length >= 2)
  if (!hasTrend) return null

  // Merge into unified timeline rows
  const allDates = Array.from(new Set(brands.flatMap(b => grouped[b].map(p => p.date))))
  const chartData = allDates.map(date => {
    const row: Record<string, unknown> = { date }
    brands.forEach(b => {
      const p = grouped[b].find(x => x.date === date)
      if (p) row[b] = p.score
    })
    return row
  })

  return (
    <div className="rounded-2xl border border-[rgba(34,211,238,0.1)] bg-[#0a1120] p-5 mb-8 animate-fade-up delay-350">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-cyan-400"/>
        <h2 className="font-['Syne'] text-sm font-bold text-white">Score Trend</h2>
        <div className="flex items-center gap-3 ml-auto">
          {brands.map((b, i) => (
            <span key={b} className="flex items-center gap-1.5 text-[11px] text-[#7a8fa6]">
              <span className="w-2 h-2 rounded-full" style={{ background: BRAND_COLORS[i % BRAND_COLORS.length] }}/>
              {b}
            </span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7a8fa6' }} axisLine={false} tickLine={false}/>
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#7a8fa6' }} axisLine={false} tickLine={false}/>
          <ReferenceLine y={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 3"/>
          <Tooltip
            contentStyle={{ background: '#0f1b30', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: '#7a8fa6', marginBottom: 4 }}
            formatter={(val: number, name: string) => [
              <span style={{ color: scoreColor(val) }}>{val}</span>,
              name,
            ]}
          />
          {brands.map((b, i) => (
            <Line key={b} type="monotone" dataKey={b} stroke={BRAND_COLORS[i % BRAND_COLORS.length]}
              strokeWidth={2} dot={{ r: 3, fill: BRAND_COLORS[i % BRAND_COLORS.length] }}
              activeDot={{ r: 5 }} connectNulls/>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

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
      // getUser() forces token refresh if needed; getSession() alone can return null
      // on first hydration when session is stored in cookie but not yet in memory
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const data = await getUserReports(user.id, session.access_token)
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

      {!loading && <TrendChart scans={completed}/>}

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
