'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Zap, Flame, AlertTriangle, Shield, CheckSquare, Square, ChevronDown, ChevronUp, Loader2, Copy, Check, ArrowUpRight } from 'lucide-react'
import type { ScanReport } from '@/lib/api'

type ActionItem = ScanReport['action_items'][number]

const priorityConfig = {
  high:   { color: 'text-rose-400',    bg: 'bg-rose-400/10 border-rose-400/20',       icon: Flame },
  medium: { color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20',     icon: AlertTriangle },
  low:    { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: Shield },
}

type Platform = 'reddit' | 'g2' | 'producthunt' | 'generic'

function detectPlatform(action: ActionItem): Platform {
  const text = (action.title + ' ' + action.description + ' ' + (action.url || '')).toLowerCase()
  if (text.includes('reddit')) return 'reddit'
  if (text.includes('g2') || text.includes('capterra') || text.includes('review')) return 'g2'
  if (text.includes('product hunt') || text.includes('producthunt')) return 'producthunt'
  return 'generic'
}

const platformLabel: Record<Platform, string> = {
  reddit: 'Post on Reddit',
  g2: 'Write G2 Review',
  producthunt: 'Launch on Product Hunt',
  generic: 'Take Action',
}

const platformColor: Record<Platform, string> = {
  reddit: 'text-orange-400 border-orange-400/30 hover:bg-orange-400/10',
  g2: 'text-rose-400 border-rose-400/30 hover:bg-rose-400/10',
  producthunt: 'text-amber-400 border-amber-400/30 hover:bg-amber-400/10',
  generic: 'text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10',
}

async function generateContent(action: ActionItem, report: Pick<ScanReport, 'target_brand' | 'website_url' | 'category'>, platform: Platform): Promise<string> {
  const systemPrompt = `You generate short, authentic platform-specific content to help SaaS founders improve their AI search visibility (GEO). Write in a natural, human tone. Never use corporate speak.`

  const platformInstructions: Record<Platform, string> = {
    reddit: `Generate a Reddit post. Return ONLY valid JSON: {"subreddit": "SaaS", "title": "...", "body": "..."}
- Title: 60-80 chars, no clickbait, no all-caps
- Body: 3-4 short paragraphs, casual tone, ends with a question to invite discussion
- Do NOT mention that this is AI-generated`,
    g2: `Generate a G2 review template the founder can customize. Return ONLY valid JSON: {"headline": "...", "body": "..."}
- Headline: 10-15 words, specific benefit
- Body: 80-120 words covering: what the product does, who it's for, one specific result/outcome
- Write in first person as if you are the user`,
    producthunt: `Generate a Product Hunt launch comment/description. Return ONLY valid JSON: {"tagline": "...", "comment": "..."}
- Tagline: under 60 chars
- Comment: 50-80 words, what problem it solves, who it's for, call to action`,
    generic: `Generate a short action summary the user can copy. Return ONLY valid JSON: {"content": "..."}
- 50-100 words max, practical and specific`,
  }

  const userPrompt = `Brand: ${report.target_brand}
Website: ${report.website_url}
Category: ${report.category}
Action to execute: ${action.title}
Context: ${action.description}

${platformInstructions[platform]}`

  const res = await fetch('/api/anthropic/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: systemPrompt, user: userPrompt }),
  })
  if (!res.ok) throw new Error('Generation failed')
  const data = await res.json()
  return data.content
}

function buildExecuteUrl(platform: Platform, generated: string, action: ActionItem): string | null {
  try {
    const parsed = JSON.parse(generated)
    if (platform === 'reddit') {
      const sub = parsed.subreddit || 'SaaS'
      return `https://www.reddit.com/r/${sub}/submit?title=${encodeURIComponent(parsed.title || '')}&text=${encodeURIComponent(parsed.body || '')}`
    }
    if (platform === 'producthunt' && action.url) return action.url
    if (action.url) return action.url
  } catch {}
  return action.url || null
}

function GeneratedPanel({ content, platform, executeUrl }: { content: string; platform: Platform; executeUrl: string | null }) {
  const [copied, setCopied] = useState(false)
  let display = content
  let copyText = content
  try {
    const parsed = JSON.parse(content)
    if (platform === 'reddit') {
      display = `**r/${parsed.subreddit}**\n\n**${parsed.title}**\n\n${parsed.body}`
      copyText = `${parsed.title}\n\n${parsed.body}`
    } else if (platform === 'g2') {
      display = `**${parsed.headline}**\n\n${parsed.body}`
      copyText = `${parsed.headline}\n\n${parsed.body}`
    } else if (platform === 'producthunt') {
      display = `**Tagline:** ${parsed.tagline}\n\n${parsed.comment}`
      copyText = `${parsed.tagline}\n\n${parsed.comment}`
    } else {
      display = parsed.content || content
      copyText = parsed.content || content
    }
  } catch {}

  return (
    <div className="mt-4 bg-[#060b14] border border-[rgba(34,211,238,0.1)] rounded-xl p-4">
      <pre className="text-xs text-[#7a8fa6] whitespace-pre-wrap leading-relaxed font-sans">{display}</pre>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(34,211,238,0.06)]">
        <button onClick={() => { navigator.clipboard.writeText(copyText); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(34,211,238,0.15)] text-xs text-[#7a8fa6] hover:text-white transition-all">
          {copied ? <Check size={11} className="text-emerald-400"/> : <Copy size={11}/>}
          {copied ? 'Copied!' : 'Copy text'}
        </button>
        {executeUrl && (
          <a href={executeUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400/30 text-xs text-cyan-400 hover:bg-cyan-400/10 transition-all">
            <ArrowUpRight size={11}/> Open platform
          </a>
        )}
      </div>
    </div>
  )
}

function SingleAction({ action, index, reportId, report }: {
  action: ActionItem
  index: number
  reportId: string
  report: Pick<ScanReport, 'target_brand' | 'website_url' | 'category'>
}) {
  const storageKey = `completed_${reportId}`
  const [done, setDone] = useState(() => {
    if (typeof window === 'undefined') return false
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]').includes(index) } catch { return false }
  })
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<string | null>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const platform = detectPlatform(action)
  const cfg = priorityConfig[action.priority]
  const Icon = cfg.icon

  function toggleDone() {
    const next = !done
    setDone(next)
    try {
      const prev: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const updated = next ? [...prev, index] : prev.filter(i => i !== index)
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {}
  }

  async function handleGenerate() {
    setGenerating(true); setGenError(null); setExpanded(true)
    try {
      const content = await generateContent(action, report, platform)
      setGenerated(content)
    } catch (e: any) {
      setGenError('Generation failed — try again')
    } finally {
      setGenerating(false)
    }
  }

  const executeUrl = generated ? buildExecuteUrl(platform, generated, action) : action.url || null

  return (
    <div className={`bg-[#0a1120] border rounded-2xl p-5 transition-all ${done ? 'opacity-50 border-[rgba(34,211,238,0.04)]' : 'border-[rgba(34,211,238,0.08)] hover:border-cyan-400/15'}`}>
      <div className="flex items-start gap-4">
        {/* Done checkbox */}
        <button onClick={toggleDone} className="flex-shrink-0 mt-0.5 text-[#3d5166] hover:text-cyan-400 transition-colors">
          {done ? <CheckSquare size={17} className="text-cyan-400"/> : <Square size={17}/>}
        </button>

        <div className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center ${cfg.bg}`}>
          <Icon size={13} className={cfg.color}/>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className={`text-sm font-semibold ${done ? 'line-through text-[#3d5166]' : 'text-white'}`}>{action.title}</p>
            <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.color}`}>{action.priority}</span>
          </div>
          <p className="text-sm text-[#7a8fa6] leading-relaxed">{action.description}</p>

          {!done && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {action.impact && <p className="text-xs text-cyan-400 flex items-center gap-1"><Zap size={10}/>{action.impact}</p>}
              {action.url && !generated && (
                <a href={action.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#7a8fa6] hover:text-cyan-400 flex items-center gap-1 transition-colors">
                  Direct link <ExternalLink size={10}/>
                </a>
              )}
              <button onClick={handleGenerate} disabled={generating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all disabled:opacity-40 ${platformColor[platform]}`}>
                {generating ? <><Loader2 size={11} className="animate-spin"/> Generating…</> : <><Zap size={11}/> {platformLabel[platform]}</>}
              </button>
              {generated && (
                <button onClick={() => setExpanded(e => !e)} className="text-xs text-[#7a8fa6] hover:text-white flex items-center gap-1 transition-colors">
                  {expanded ? <><ChevronUp size={11}/> Hide</> : <><ChevronDown size={11}/> Show draft</>}
                </button>
              )}
            </div>
          )}

          {genError && <p className="text-xs text-rose-400 mt-2">{genError}</p>}
          {generated && expanded && <GeneratedPanel content={generated} platform={platform} executeUrl={executeUrl}/>}
        </div>
      </div>
    </div>
  )
}

export default function PriorityActions({ actions, reportId, report }: {
  actions: ScanReport['action_items']
  reportId: string
  report: Pick<ScanReport, 'target_brand' | 'website_url' | 'category'>
}) {
  if (!actions.length) return null
  return (
    <div className="space-y-3">
      {actions.map((action, i) => (
        <SingleAction key={i} action={action} index={i} reportId={reportId} report={report}/>
      ))}
    </div>
  )
}
