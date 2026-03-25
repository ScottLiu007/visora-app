'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getPublicReport, scoreColor, scoreLabel, type ScanReport } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { ExternalLink, Loader2, AlertTriangle, Sparkles } from 'lucide-react'

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score)
  const label = scoreLabel(score)
  const r = 56; const sw = 9
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 130, height: 130 }}>
      <svg width={130} height={130} viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth={sw}/>
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 6px ${color}66)` }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono text-white leading-none">{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color }}>{label}</span>
      </div>
    </div>
  )
}

export default function PublicSharePage() {
  const params = useParams<{ token: string }>()
  const [report, setReport] = useState<ScanReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await getPublicReport(params.token)
        if (!cancelled) setReport(data)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [params.token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-[#7a8fa6]">
        <Loader2 size={18} className="animate-spin"/> Loading report…
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-rose-400/10 border border-rose-400/20 rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="text-rose-400 mx-auto mb-3" size={28}/>
          <p className="text-white font-semibold mb-2">Link invalid or expired</p>
          <p className="text-sm text-[#7a8fa6] mb-6">{error}</p>
          <Link href="https://visoraapp.com" className="text-cyan-400 text-sm hover:text-cyan-300">visoraapp.com</Link>
        </div>
      </div>
    )
  }

  const color = scoreColor(report.score)

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-[rgba(34,211,238,0.08)]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7a8fa6] mb-1">Shared GEO report</p>
          <h1 className="font-['Syne'] text-2xl font-bold text-white">{report.target_brand}</h1>
          <p className="text-xs text-[#3d5166] mt-1">{formatDate(report.created_at)}</p>
        </div>
        <a href={report.website_url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300">
          Website <ExternalLink size={12}/>
        </a>
      </div>

      <div className="flex flex-col items-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-4">GEO Score</p>
        <div className="rounded-2xl border p-8 bg-[#0a1120]" style={{ borderColor: `${color}22` }}>
          <ScoreRing score={report.score}/>
        </div>
      </div>

      {report.action_items?.length > 0 && (
        <div className="mb-10">
          <h2 className="font-['Syne'] text-sm font-bold text-white mb-4">Priority actions</h2>
          <div className="space-y-3">
            {report.action_items.slice(0, 5).map((a, i) => (
              <div key={i} className="bg-[#0a1120] border border-[rgba(34,211,238,0.08)] rounded-xl p-4">
                <p className="text-sm font-semibold text-white">{a.title}</p>
                <p className="text-xs text-[#7a8fa6] mt-1 leading-relaxed">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.citation_opportunities && report.citation_opportunities.length > 0 && (
        <div className="mb-10">
          <h2 className="font-['Syne'] text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400"/> Citation opportunities
          </h2>
          <p className="text-xs text-[#3d5166] mb-4">Where AI tends to cite brands in your niche — ideas to close the gap.</p>
          <div className="space-y-3">
            {report.citation_opportunities.map((o, i) => (
              <div key={i} className="bg-[#0a1120] border border-amber-400/10 rounded-xl p-4">
                <p className="text-sm font-semibold text-white">{o.title}</p>
                <p className="text-[10px] text-amber-400/80 mt-1">{o.platform}</p>
                <p className="text-xs text-[#7a8fa6] mt-2">{o.why}</p>
                <p className="text-xs text-cyan-400/90 mt-2">{o.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/5 to-transparent p-6 text-center">
        <p className="text-sm text-[#7a8fa6] mb-3">Run your own AI visibility scans</p>
        <a href="https://visoraapp.com" className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#060b14] font-bold px-5 py-2.5 rounded-xl text-sm">
          Try Visora
        </a>
      </div>
    </div>
  )
}
