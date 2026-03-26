'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getReport, getUserReports, createShareLink, scoreColor, scoreLabel, type ScanReport } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, ExternalLink, AlertTriangle, TrendingUp, Loader2, RefreshCw, Copy, Check, ChevronDown, ChevronUp, Zap, Shield, Flame, CheckCircle2, XCircle, Info, Link2, Sparkles } from 'lucide-react'
import PriorityActions from '@/components/PriorityActions'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

// ── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score)
  const label = scoreLabel(score)
  const r = 56; const sw = 9
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <div className="relative inline-flex items-center justify-center" style={{width:130,height:130}}>
      <svg width={130} height={130} viewBox="0 0 130 130" style={{transform:'rotate(-90deg)'}}>
        <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth={sw}/>
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{transition:'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)',filter:`drop-shadow(0 0 6px ${color}66)`}}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono text-white leading-none">{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{color}}>{label}</span>
      </div>
    </div>
  )
}

// ── Radar Chart ──────────────────────────────────────────────────────────────
function ScoreRadar({ b }: { b: ScanReport['score_breakdown'] }) {
  const data = [
    { label: 'Appearance', value: b.appearance_rate },
    { label: 'Density',    value: b.citation_density },
    { label: 'Sentiment',  value: b.sentiment },
    { label: 'Sources',    value: b.source_quality },
  ]
  return (
    <ResponsiveContainer width="100%" height={210}>
      <RadarChart data={data} margin={{top:10,right:20,bottom:10,left:20}}>
        <PolarGrid stroke="rgba(34,211,238,0.08)"/>
        <PolarAngleAxis dataKey="label" tick={{fill:'#7a8fa6',fontSize:11,fontFamily:'DM Mono'}}/>
        <Radar name="Score" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.12} dot={{r:3,fill:'#22d3ee'}}/>
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ── Gap Bar Chart ─────────────────────────────────────────────────────────────
function GapChart({ gaps }: { gaps: ScanReport['citation_gaps'] }) {
  const data = gaps.map(g => ({
    name: g.competitor,
    gap: Math.round(g.gap_score * 100),
    color: g.gap_score > 0.6 ? '#fb7185' : g.gap_score > 0.3 ? '#fbbf24' : '#34d399',
  }))
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{left:0,right:16}}>
        <XAxis type="number" domain={[0,100]} tick={{fill:'#3d5166',fontSize:10}}/>
        <YAxis dataKey="name" type="category" tick={{fill:'#7a8fa6',fontSize:11}} width={90}/>
        <Tooltip contentStyle={{background:'#0f1b30',border:'1px solid rgba(34,211,238,0.15)',borderRadius:10,fontSize:12}}
          labelStyle={{color:'#f0f4f8'}} itemStyle={{color:'#7a8fa6'}} formatter={(v:number) => [`${v} gap pts`,'Gap']}/>
        <Bar dataKey="gap" radius={[0,6,6,0]}>{data.map((d,i) => <Cell key={i} fill={d.color}/>)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Code Block ────────────────────────────────────────────────────────────────
function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen]     = useState(false)
  function copy() { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="border border-[rgba(34,211,238,0.1)] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 bg-[#0f1b30] hover:bg-[#162340] transition-colors">
        <span className="text-xs font-semibold text-[#7a8fa6] font-mono">{label}</span>
        {open ? <ChevronUp size={14} className="text-[#3d5166]"/> : <ChevronDown size={14} className="text-[#3d5166]"/>}
      </button>
      {open && (
        <div className="relative">
          <pre className="p-4 text-[11px] font-mono text-[#7a8fa6] overflow-x-auto max-h-48 leading-relaxed">{code}</pre>
          <button onClick={copy} className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0a1120] border border-[rgba(34,211,238,0.15)] text-[10px] text-[#7a8fa6] hover:text-cyan-400 transition-colors">
            {copied ? <Check size={10} className="text-emerald-400"/> : <Copy size={10}/>}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Sk({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`}/>
}



// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const params  = useParams<{ id: string }>()
  const router  = useRouter()
  const supabase = createClient()
  const [report, setReport]         = useState<ScanReport | null>(null)
  const [prevScore, setPrevScore]   = useState<number | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [polling, setPolling]       = useState(false)
  const [shareBusy, setShareBusy]   = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      const [data, allScans] = await Promise.all([
        getReport(params.id, session.access_token),
        getUserReports(session.user.id, session.access_token),
      ])
      setReport(data)
      setPolling(data.status === 'running' || data.status === 'pending')
      // Find the most recent completed scan for same brand before this one
      const prev = allScans
        .filter(s => s.id !== params.id && s.status === 'complete' && s.target_brand === data.target_brand)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      setPrevScore(prev?.score ?? null)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [params.id])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (!polling) return; const t = setInterval(load, 4000); return () => clearInterval(t) }, [polling, load])

  const copyPublicLink = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !report) return
    setShareBusy(true)
    try {
      const { shareUrl } = await createShareLink(report.id, session.access_token)
      await navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    } catch {
      /* ignore */
    } finally {
      setShareBusy(false)
    }
  }, [report, supabase])

  if (loading) return (
    <div className="p-8 max-w-5xl space-y-6">
      <Sk className="h-8 w-48"/><div className="grid grid-cols-3 gap-4"><Sk className="h-48"/><Sk className="h-48"/><Sk className="h-48"/></div><Sk className="h-64"/>
    </div>
  )

  if (error || !report) return (
    <div className="p-8 max-w-xl">
      <div className="bg-rose-400/10 border border-rose-400/20 rounded-2xl p-6 text-center">
        <AlertTriangle size={28} className="text-rose-400 mx-auto mb-3"/>
        <p className="text-white font-semibold mb-1">Report not found</p>
        <p className="text-sm text-[#7a8fa6] mb-5">{error}</p>
        <button onClick={() => router.back()} className="text-sm text-cyan-400 hover:text-cyan-300">← Go back</button>
      </div>
    </div>
  )

  if (report.status === 'pending' || report.status === 'running') return (
    <div className="p-8 max-w-xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#7a8fa6] hover:text-white mb-8 transition-colors"><ArrowLeft size={14}/> Overview</Link>
      <div className="bg-[#0a1120] border border-cyan-400/15 rounded-2xl p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-6">
          <Loader2 size={28} className="text-cyan-400 animate-spin"/>
        </div>
        <h2 className="font-['Syne'] text-xl font-bold text-white mb-2">Scanning…</h2>
        <p className="text-sm text-[#7a8fa6] mb-1">Querying AI search engines for <span className="text-white">{report.target_brand}</span></p>
        <p className="text-xs text-[#3d5166]">Takes ~60 seconds. Page auto-refreshes.</p>
      </div>
    </div>
  )

  const color = scoreColor(report.score)
  const delta = prevScore !== null ? report.score - prevScore : null
  const deltaColor = delta === null ? '' : delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-[#7a8fa6]'
  const deltaLabel = delta === null ? null : delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0'

  return (
    <div className="p-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-[#7a8fa6] hover:text-white mb-3 transition-colors"><ArrowLeft size={12}/> Overview</Link>
          <div className="flex items-center gap-3">
            <h1 className="font-['Syne'] text-2xl font-bold text-white">{report.target_brand}</h1>
            {deltaLabel && (
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                delta! > 0 ? 'bg-emerald-400/10 border-emerald-400/20' :
                delta! < 0 ? 'bg-rose-400/10 border-rose-400/20' :
                'bg-[#0f1b30] border-[rgba(34,211,238,0.1)]'
              } ${deltaColor}`}>
                {deltaLabel} vs last scan
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <a href={report.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#7a8fa6] hover:text-cyan-400 transition-colors">
              {report.website_url} <ExternalLink size={10}/>
            </a>
            <span className="text-[#3d5166] text-xs">·</span>
            <span className="text-xs text-[#7a8fa6]">{formatDate(report.created_at)}</span>
            <span className="text-xs text-[#3d5166] bg-[#0f1b30] border border-[rgba(34,211,238,0.08)] px-2 py-0.5 rounded-lg">{report.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void copyPublicLink()} disabled={shareBusy}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[rgba(34,211,238,0.15)] text-[#7a8fa6] hover:text-white text-sm transition-all disabled:opacity-40">
            {shareCopied ? <Check size={13} className="text-emerald-400"/> : <Link2 size={13}/>}
            {shareCopied ? 'Copied link' : 'Public link'}
          </button>
          <button onClick={load} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[rgba(34,211,238,0.15)] text-[#7a8fa6] hover:text-white text-sm transition-all">
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>

      {/* Top row: Score + Radar + Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up delay-100">
        <div className="bg-[#0a1120] border rounded-2xl p-6 flex flex-col items-center" style={{borderColor:`${color}22`}}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-5">GEO Score</p>
          <ScoreRing score={report.score}/>
          <div className="mt-5 grid grid-cols-2 gap-3 w-full">
            {([['Appearance', report.score_breakdown.appearance_rate],['Density', report.score_breakdown.citation_density],['Sentiment', report.score_breakdown.sentiment],['Sources', report.score_breakdown.source_quality]] as [string,number][]).map(([l,v]) => (
              <div key={l} className="bg-[#0f1b30] rounded-xl p-2.5 text-center">
                <p className="text-base font-bold font-mono text-white">{Math.round(v)}</p>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-[#7a8fa6] mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0a1120] border border-[rgba(34,211,238,0.1)] rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-2">Score Dimensions</p>
          <ScoreRadar b={report.score_breakdown}/>
        </div>
        <div className="bg-[#0a1120] border border-[rgba(34,211,238,0.1)] rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-4">Citation Gap vs Competitors</p>
          {report.citation_gaps.length ? <GapChart gaps={report.citation_gaps}/> : <p className="text-sm text-[#3d5166] text-center py-8">No competitors tracked</p>}
        </div>
      </div>

      {/* Action Items — P1 one-click execute + P2 completion state */}
      <div className="animate-fade-up delay-200">
        <h2 className="font-['Syne'] text-base font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-cyan-400"/> Priority Actions
        </h2>
        <PriorityActions
          actions={report.action_items}
          reportId={params.id}
          report={{ target_brand: report.target_brand, website_url: report.website_url, category: report.category, competitors: report.competitors }}
        />
      </div>

      {/* Score Breakdown — How we scored you */}
      <div className="animate-fade-up delay-250">
        <h2 className="font-['Syne'] text-base font-bold text-white mb-4 flex items-center gap-2">
          <Info size={16} className="text-cyan-400"/> How We Scored You
        </h2>
        <div className="bg-[#0a1120] border border-[rgba(34,211,238,0.08)] rounded-2xl p-6">
          {/* Stats summary */}
          {report.score_breakdown.stats && (
            <p className="text-sm text-[#7a8fa6] mb-5">
              Your brand appeared in{' '}
              <span className="text-white font-semibold">{report.score_breakdown.stats.appearances}</span>
              {' '}of{' '}
              <span className="text-white font-semibold">{report.score_breakdown.stats.total_questions}</span>
              {' '}AI queries
              {report.score_breakdown.stats.total_mentions > 0 && (
                <>, mentioned <span className="text-white font-semibold">{report.score_breakdown.stats.total_mentions}</span> time{report.score_breakdown.stats.total_mentions !== 1 ? 's' : ''} total</>
              )}.
            </p>
          )}
          {/* Weight breakdown */}
          <div className="space-y-3">
            {([
              { key: 'appearance_rate',  label: 'Appearance Rate',  desc: 'How often your brand appeared across all queries', weight: 0.50 },
              { key: 'citation_density', label: 'Mention Density',  desc: 'How many times you appeared when you did appear', weight: 0.20 },
              { key: 'sentiment',        label: 'Sentiment',        desc: 'Whether AI mentioned you in a positive context',  weight: 0.15 },
              { key: 'source_quality',   label: 'Source Quality',   desc: 'Authority of sites AI cited alongside your brand', weight: 0.15 },
            ] as const).map(({ key, label, desc, weight }) => {
              const raw = report.score_breakdown[key] as number
              const contribution = Math.round(raw * weight)
              const pct = Math.round(weight * 100)
              return (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-32 flex-shrink-0">
                    <p className="text-xs font-semibold text-white">{label}</p>
                    <p className="text-[10px] text-[#3d5166] mt-0.5">{pct}% weight</p>
                  </div>
                  <div className="flex-1 h-1.5 bg-[#0f1b30] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${raw}%`, background: raw > 50 ? '#34d399' : raw > 20 ? '#fbbf24' : '#fb7185' }}
                    />
                  </div>
                  <div className="w-20 flex-shrink-0 text-right">
                    <span className="text-xs font-mono text-white">{Math.round(raw)}</span>
                    <span className="text-[10px] text-[#3d5166]"> → +{contribution} pts</span>
                  </div>
                  <p className="hidden lg:block w-52 text-[10px] text-[#3d5166] leading-tight">{desc}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[rgba(34,211,238,0.06)] flex items-center justify-between">
            <p className="text-xs text-[#3d5166]">Weighted composite score</p>
            <p className="text-sm font-bold font-mono text-white">{report.score} / 100</p>
          </div>
        </div>
      </div>

      {/* Scan Questions — transparency log */}
      {report.scan_questions && report.scan_questions.length > 0 && (
        <div className="animate-fade-up delay-300">
          <h2 className="font-['Syne'] text-base font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400"/> Queries Asked to AI
            <span className="text-xs font-normal text-[#3d5166] ml-1">— did your brand appear?</span>
          </h2>
          <div className="bg-[#0a1120] border border-[rgba(34,211,238,0.08)] rounded-2xl divide-y divide-[rgba(34,211,238,0.05)]">
            {report.scan_questions.map((q, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className="flex-shrink-0 mt-0.5">
                  {q.brand_mentioned
                    ? <CheckCircle2 size={14} className="text-emerald-400"/>
                    : <XCircle size={14} className="text-[#3d5166]"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${q.brand_mentioned ? 'text-white' : 'text-[#7a8fa6]'}`}>{q.question}</p>
                  {q.competitors_mentioned.length > 0 && (
                    <p className="text-[10px] text-amber-400/70 mt-0.5">
                      AI cited: {q.competitors_mentioned.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {q.brand_mentioned
                    ? <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">Cited</span>
                    : <span className="text-[10px] font-semibold text-[#3d5166] bg-[#0f1b30] px-2 py-0.5 rounded-md">Missed</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Content */}
      {report.generated_content && Object.keys(report.generated_content).length > 0 && (
        <div className="animate-fade-up delay-300">
          <h2 className="font-['Syne'] text-base font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={16} className="text-cyan-400"/> Generated Content
          </h2>
          <div className="space-y-3">
            {report.generated_content.faq    && <CodeBlock label="FAQ Schema (JSON-LD)"   code={report.generated_content.faq}/>}
            {report.generated_content.schema && <CodeBlock label="Organization Schema"     code={report.generated_content.schema}/>}
            {report.generated_content.llms_txt && <CodeBlock label="llms.txt"             code={report.generated_content.llms_txt}/>}
          </div>
        </div>
      )}

      {/* Competitor Source Attribution — why does AI cite them? */}
      {report.competitor_sources && Object.keys(report.competitor_sources).length > 0 &&
       Object.values(report.competitor_sources).some(v => v.length > 0) && (
        <div className="animate-fade-up delay-400">
          <h2 className="font-['Syne'] text-base font-bold text-white mb-1 flex items-center gap-2">
            <Info size={16} className="text-amber-400"/> Why AI Cites Your Competitors
          </h2>
          <p className="text-xs text-[#3d5166] mb-4">These are the platforms driving competitor citations. Getting listed on the same platforms will close the gap.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(report.competitor_sources)
              .filter(([, sources]) => sources.length > 0)
              .map(([competitor, sources]) => (
              <div key={competitor} className="bg-[#0a1120] border border-amber-400/10 rounded-2xl p-5">
                <p className="text-sm font-semibold text-white mb-3">
                  <span className="text-amber-400">{competitor}</span>
                  <span className="text-[#3d5166] font-normal text-xs ml-2">gets cited via:</span>
                </p>
                <div className="space-y-2">
                  {sources.slice(0, 6).map(([domain, count], i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-[#0f1b30] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400/50 rounded-full"
                          style={{ width: `${Math.min((count / (sources[0]?.[1] || 1)) * 100, 100)}%` }}/>
                      </div>
                      <span className="text-xs font-mono text-[#7a8fa6] w-32 truncate">{domain}</span>
                      <span className="text-xs font-mono text-amber-400 w-8 text-right">{count}×</span>
                    </div>
                  ))}
                </div>
                {sources.length === 0 && (
                  <p className="text-xs text-[#3d5166]">No citation sources detected for this competitor</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {report.citation_opportunities && report.citation_opportunities.length > 0 && (
        <div className="animate-fade-up delay-450">
          <h2 className="font-['Syne'] text-base font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400"/> Citation opportunities
          </h2>
          <p className="text-xs text-[#3d5166] mb-4">Where AI tends to cite brands in your niche — concrete ideas to earn the same visibility.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.citation_opportunities.map((o, i) => (
              <div key={i} className="bg-[#0a1120] border border-amber-400/12 rounded-2xl p-5">
                <p className="text-sm font-semibold text-white">{o.title}</p>
                <p className="text-[10px] text-amber-400/90 mt-1 uppercase tracking-wider">{o.platform}</p>
                <p className="text-sm text-[#7a8fa6] mt-3 leading-relaxed">{o.why}</p>
                <p className="text-xs text-cyan-400/90 mt-3 leading-relaxed border-t border-[rgba(34,211,238,0.08)] pt-3">{o.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
