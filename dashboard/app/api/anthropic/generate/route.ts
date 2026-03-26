import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const MODEL = 'google/gemini-2.0-flash-001'

export async function POST(req: NextRequest) {
  try {
    const { system, user } = await req.json()
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dashboard.visoraapp.com',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: user },
        ],
      }),
    })
    if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    return NextResponse.json({ content })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
