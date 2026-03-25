const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ScanRequest {
  targetBrand: string
  websiteUrl: string
  category: string
  keywords?: string
  competitors: string[]
  questionLimit?: number
  userId?: string
}

export interface ScanReport {
  id: string
  user_id: string
  target_brand: string
  website_url: string
  category: string
  competitors: string[]
  score: number
  score_breakdown: {
    appearance_rate: number
    citation_density: number
    sentiment: number
    source_quality: number
    weights?: { appearance_rate: number; citation_density: number; sentiment: number; source_quality: number }
    stats?: { appearances: number; total_questions: number; total_mentions: number }
  }
  citation_gaps: Array<{
    competitor: string
    sources: string[]
    gap_score: number
  }>
  action_items: Array<{
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string
    url?: string | null
  }>
  scan_questions?: Array<{
    question: string
    brand_mentioned: boolean
    competitors_mentioned: string[]
  }>
  competitor_sources?: Record<string, Array<[string, number]>>
  generated_content?: {
    faq?: string
    schema?: string
    llms_txt?: string
  }
  created_at: string
  status: 'pending' | 'running' | 'complete' | 'error'
}

// Friendly network error messages
function normalizeError(e: unknown): Error {
  if (e instanceof TypeError && (e.message === 'Failed to fetch' || e.message.includes('fetch'))) {
    return new Error('Unable to reach the server. Please check your connection and try again.')
  }
  if (e instanceof Error) return e
  return new Error(String(e))
}

// fetch with 15s timeout
async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Request timed out. The server may be slow — please try again.')
    }
    throw normalizeError(e)
  } finally {
    clearTimeout(timer)
  }
}

export async function getUserPlan(userId: string, token: string): Promise<{ plan: string; scan_credits: number }> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/user/plan?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return { plan: 'starter', scan_credits: 1 }
    return res.json()
  } catch {
    // Silently fall back — scan page shows credits as 1 so user can still try
    return { plan: 'starter', scan_credits: 1 }
  }
}

export async function triggerScan(data: ScanRequest, token: string): Promise<{ scanId: string }> {
  try {
    // Scan takes ~60s — use 120s timeout
    const res = await fetchWithTimeout(`${API_URL}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }, 120000)
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  } catch (e) {
    throw normalizeError(e)
  }
}

export async function getReport(id: string, token: string): Promise<ScanReport> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/report/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  } catch (e) {
    throw normalizeError(e)
  }
}

export async function getUserReports(userId: string, token: string): Promise<ScanReport[]> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/report/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return data.scans || []
  } catch (e) {
    throw normalizeError(e)
  }
}

export function scoreColor(score: number): string {
  if (score >= 75) return '#34d399'
  if (score >= 50) return '#fbbf24'
  return '#fb7185'
}

export function scoreLabel(score: number): string {
  if (score >= 75) return 'Strong'
  if (score >= 50) return 'Moderate'
  return 'Weak'
}
