// visora/mvp/src/opportunities.js
// One Perplexity call: concrete citation / distribution opportunities (GEO "where to show up")

import OpenAI from 'openai';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || process.env.OPENROUTER_API_KEY;
const USE_OPENROUTER = !!process.env.OPENROUTER_API_KEY;

const client = PERPLEXITY_API_KEY
  ? new OpenAI({
      baseURL: USE_OPENROUTER ? 'https://openrouter.ai/api/v1' : 'https://api.perplexity.ai',
      apiKey: PERPLEXITY_API_KEY,
      defaultHeaders: USE_OPENROUTER
        ? { 'HTTP-Referer': 'https://visoraapp.com', 'X-Title': 'Visora GEO' }
        : {},
    })
  : null;

const MODEL = USE_OPENROUTER ? 'perplexity/sonar' : 'sonar';

/**
 * Returns 3–5 structured opportunities where competitors tend to get cited by AI.
 */
export async function fetchCitationOpportunities({
  targetBrand,
  competitors = [],
  category,
  keywords,
}) {
  if (!client) return [];

  const niche = keywords?.trim() || category || 'this space';
  const compList = (competitors || []).filter(Boolean).slice(0, 5).join(', ') || 'similar tools';

  const prompt = `You are a GEO (generative engine optimization) strategist.

Context:
- Target product/brand: "${targetBrand}"
- Category: ${category}
- Niche keywords: ${niche}
- Named competitors users compare against: ${compList}

Task: List 4–6 **specific, actionable citation opportunities** — places or content types where AI assistants often cite brands in this niche (e.g. G2 grids, Reddit threads, comparison blog posts, GitHub, niche directories, Product Hunt, industry newsletters). For each item, explain in one sentence WHY AI search tends to cite sources there, and one concrete next step for ${targetBrand}.

Rules:
- Be specific (name real platform types or content formats; avoid generic "do SEO").
- JSON ONLY, no markdown. Schema:
[{"title":"short title","platform":"where","why":"why AI cites this","action":"one concrete step for the brand"}]

Max 6 items.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
    });
    const text = response.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.title === 'string')
      .slice(0, 6)
      .map((x) => ({
        title: String(x.title).slice(0, 200),
        platform: String(x.platform || x.where || '—').slice(0, 120),
        why: String(x.why || '').slice(0, 400),
        action: String(x.action || x.suggested_action || '').slice(0, 400),
      }));
  } catch (e) {
    console.error('fetchCitationOpportunities:', e.message);
    return [];
  }
}
