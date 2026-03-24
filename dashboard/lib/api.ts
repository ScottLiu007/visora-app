const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ScanRequest {
  targetBrand: string
  websiteUrl: string
  category: string
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
  }>
  generated_content?: {
    faq?: string
    schema?: string
    llms_txt?: string
  }
  created_at: string
  status: 'pending' | 'running' | 'complete' | 'error'
}

export async function triggerScan(data: ScanRequest, token: string): Promise<{ scanId: string }> {
  const res = await fetch(`${API_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getReport(id: string, token: string): Promise<ScanReport> {
  const res = await fetch(`${API_URL}/api/report/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getUserReports(userId: string, token: string): Promise<ScanReport[]> {
  const res = await fetch(`${API_URL}/api/report/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.scans || []
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
