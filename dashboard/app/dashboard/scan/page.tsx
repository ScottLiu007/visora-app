'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { triggerScan, getUserPlan } from '@/lib/api'
import { PlusCircle, X, Loader2, Zap, Info } from 'lucide-react'
import UpgradeWall from '@/components/ui/UpgradeWall'

const CATEGORIES = ['SaaS / Software','E-commerce','Marketing / Agency','Finance / Fintech','Health / Wellness','Developer Tools','Education','AI / ML','Other']

export default function NewScanPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [brand, setBrand]             = useState('')
  const [url, setUrl]                 = useState('')
  const [category, setCategory]       = useState(CATEGORIES[0])
  const [keywords, setKeywords]       = useState('')
  const [competitors, setCompetitors] = useState<string[]>([''])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [planStatus, setPlanStatus]   = useState<{ plan: string; scan_credits: number } | null>(null)
  const [planLoading, setPlanLoading] = useState(true)

  // Check plan on mount
  useEffect(() => {
    async function checkPlan() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const status = await getUserPlan(session.user.id, session.access_token)
        setPlanStatus(status)
      } catch {
        setPlanStatus({ plan: 'starter', scan_credits: 1 })
      } finally {
        setPlanLoading(false)
      }
    }
    checkPlan()
  }, [])

  const needsUpgrade = planStatus?.plan === 'starter' && (planStatus?.scan_credits ?? 0) <= 0

  const addCompetitor    = () => { if (competitors.length < 5) setCompetitors(c => [...c, '']) }
  const removeCompetitor = (i: number) => setCompetitors(c => c.filter((_, idx) => idx !== i))
  const updateCompetitor = (i: number, v: string) => setCompetitors(c => c.map((x, idx) => idx === i ? v : x))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = competitors.filter(c => c.trim())
    if (!valid.length) { setError('Add at least one competitor'); return }
    setLoading(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const { scanId } = await triggerScan(
        { targetBrand: brand.trim(), websiteUrl: url.trim(), category, keywords: keywords.trim() || undefined, competitors: valid, userId: session.user.id, questionLimit: 10 },
        session.access_token
      )
      router.push(`/dashboard/report/${scanId}`)
    } catch (err: any) {
      if (err.message?.includes('upgrade_required') || err.message?.includes('402')) {
        setPlanStatus(s => s ? { ...s, scan_credits: 0 } : { plan: 'starter', scan_credits: 0 })
      } else {
        setError(err.message || 'Scan failed — is the backend running?')
      }
      setLoading(false)
    }
  }

  // Loading state
  if (planLoading) {
    return (
      <div className="p-8 flex items-center gap-3 text-[#7a8fa6]">
        <Loader2 size={16} className="animate-spin" /> Checking your plan…
      </div>
    )
  }

  // Upgrade wall
  if (needsUpgrade) return <UpgradeWall />

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Syne'] text-2xl font-bold text-white mb-1">New GEO Scan</h1>
            <p className="text-sm text-[#7a8fa6]">We'll query AI search engines and measure how often your brand appears.</p>
          </div>
          {planStatus?.plan === 'starter' && (
            <div className="text-right">
              <span className="text-xs text-[#7a8fa6]">Free scans left</span>
              <div className="text-xl font-bold text-cyan-400">{planStatus.scan_credits}</div>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up delay-100">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-2">Brand Name</label>
          <input value={brand} onChange={e => setBrand(e.target.value)} required placeholder="e.g. Visora"
            className="w-full bg-[#0a1120] border border-[rgba(34,211,238,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3d5166] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"/>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-2">Website URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)} required type="url" placeholder="https://yoursite.com"
            className="w-full bg-[#0a1120] border border-[rgba(34,211,238,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3d5166] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"/>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#7a8fa6] mb-2">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-[#0a1120] border border-[rgba(34,211,238,0.12)] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all appearance-none cursor-pointer">
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0a1120]">{c}</option>)}
          </select>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#7a8fa6]">Product Keywords</label>
            <span className="text-[10px] text-[#3d5166] bg-[#0f1b30] px-1.5 py-0.5 rounded-md">Optional</span>
          </div>
          <input value={keywords} onChange={e => setKeywords(e.target.value)}
            placeholder="e.g. GEO optimization, AI visibility, SEO tool"
            className="w-full bg-[#0a1120] border border-[rgba(34,211,238,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3d5166] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"/>
          <p className="text-[10px] text-[#3d5166] mt-1.5">Describe what your product does — used to generate specific AI queries (e.g. "GEO optimization tool" instead of "SaaS / Software")</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#7a8fa6]">Competitors <span className="text-[#3d5166] normal-case tracking-normal font-normal">(up to 5)</span></label>
            <span className="flex items-center gap-1 text-[#7a8fa6] text-xs"><Info size={11}/> Brand names only</span>
          </div>
          <div className="space-y-2.5">
            {competitors.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input value={c} onChange={e => updateCompetitor(i, e.target.value)} placeholder={`Competitor ${i+1}`}
                  className="flex-1 bg-[#0a1120] border border-[rgba(34,211,238,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3d5166] focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"/>
                {competitors.length > 1 && (
                  <button type="button" onClick={() => removeCompetitor(i)}
                    className="w-11 h-11 mt-0.5 rounded-xl border border-[rgba(34,211,238,0.08)] flex items-center justify-center text-[#3d5166] hover:text-rose-400 hover:border-rose-400/20 transition-all">
                    <X size={14}/>
                  </button>
                )}
              </div>
            ))}
          </div>
          {competitors.length < 5 && (
            <button type="button" onClick={addCompetitor} className="mt-3 flex items-center gap-1.5 text-xs text-[#7a8fa6] hover:text-cyan-400 transition-colors">
              <PlusCircle size={13}/> Add competitor
            </button>
          )}
        </div>
        <div className="flex items-start gap-3 bg-cyan-400/5 border border-cyan-400/10 rounded-xl px-4 py-3.5">
          <Zap size={14} className="text-cyan-400 mt-0.5 flex-shrink-0"/>
          <p className="text-xs text-[#7a8fa6] leading-relaxed">The scan asks 10 questions to an AI search engine and measures how often your brand is cited vs competitors. Takes ~60 seconds.</p>
        </div>
        {error && <div className="bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3 text-sm text-rose-400">{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-[#060b14] font-bold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={15} className="animate-spin"/> Running scan… (~60s)</> : <><Zap size={15}/> Run GEO Scan</>}
        </button>
      </form>
    </div>
  )
}
