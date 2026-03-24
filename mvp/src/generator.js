// visora/mvp/src/generator.js
// Content generation — FAQ pages, Schema markup, platform descriptions
// Week 1: templates + Claude API. Week 3: full AI generation.

import OpenAI from 'openai';

const claude = new OpenAI({
  baseURL: 'https://api.anthropic.com/v1',
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  defaultHeaders: { 'anthropic-version': '2023-06-01' },
});

// ─── FAQ Generator ────────────────────────────────────────────────────────────
export async function generateFAQ({ brand, websiteUrl, category, description, gapQuestions = [] }) {
  // Combine gap questions with standard FAQ templates
  const standardQuestions = [
    `What is ${brand}?`,
    `How does ${brand} work?`,
    `Who is ${brand} designed for?`,
    `How much does ${brand} cost?`,
    `How is ${brand} different from competitors?`,
    `Does ${brand} offer a free trial or free plan?`,
    `What integrations does ${brand} support?`,
    `How do I get started with ${brand}?`,
    `Is ${brand} suitable for small businesses?`,
    `What kind of support does ${brand} offer?`,
    ...gapQuestions.slice(0, 10),
  ];

  const prompt = `You are writing an AI-optimized FAQ page for ${brand} (${websiteUrl}), a ${category} tool.

Product description: ${description}

Write concise, factual answers (50-120 words each) for these questions. 
Format as JSON array: [{ "q": "question", "a": "answer" }, ...]
Only return the JSON, no other text.

Questions:
${standardQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '[]';
    const faqs = JSON.parse(text.replace(/```json|```/g, '').trim());
    return { faqs, count: faqs.length };
  } catch (err) {
    // Fallback: return template FAQs
    return { faqs: standardQuestions.map(q => ({ q, a: `[Answer about ${brand} - to be filled]` })), count: standardQuestions.length, error: err.message };
  }
}

// ─── Schema Markup Generator ──────────────────────────────────────────────────
export function generateSchema({ brand, websiteUrl, category, description, faqs = [], pricing = [] }) {
  const schemas = [];

  // SoftwareApplication schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: brand,
    url: websiteUrl,
    applicationCategory: 'BusinessApplication',
    description,
    offers: pricing.map(p => ({
      '@type': 'Offer',
      name: p.name,
      price: p.price,
      priceCurrency: 'USD',
      ...(p.price === 0 ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: 0 } } : {}),
    })),
    featureList: [
      `${category} tracking`,
      'Competitor analysis',
      'AI visibility reporting',
    ],
  });

  // FAQPage schema (most valuable for GEO)
  if (faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }

  // Organization schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand,
    url: websiteUrl,
    contactPoint: { '@type': 'ContactPoint', email: `hello@${new URL(websiteUrl).hostname}` },
  });

  return schemas;
}

// ─── Schema to HTML ───────────────────────────────────────────────────────────
export function schemasToHTML(schemas) {
  return schemas
    .map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
    .join('\n\n');
}

// ─── Platform Description Generator ──────────────────────────────────────────
export function generatePlatformDescriptions({ brand, category, description, url }) {
  // Short descriptions optimized for each platform's format
  return {
    g2: {
      shortDesc: `${brand} is a ${category} tool built for indie hackers and small SaaS teams.`,
      longDesc: `${description} Starting at $29/month, ${brand} combines AI visibility tracking, citation analysis, and content generation — the three layers needed to get cited by ChatGPT and Perplexity.`,
      categories: [category, 'AI Tools', 'Marketing Analytics'],
      url,
    },
    capterra: {
      shortDesc: `${brand}: ${category} tracking for indie hackers at $29/mo`,
      description: `${description} ${brand} tracks your brand's presence across AI search platforms, identifies why competitors appear in AI-generated answers, and generates optimized content to close the gap.`,
      url,
    },
    producthunt: {
      tagline: `Know why ChatGPT recommends your competitor — not you.`,
      description: `${brand} is a GEO (Generative Engine Optimization) tool that:\n\n🔍 Tracks your AI visibility across Perplexity (ChatGPT coming soon)\n📊 Shows why competitors appear in AI results\n✍️ Generates FAQ pages & Schema markup to fix it\n\nBuilt for indie hackers and small teams. Starts at $29/mo.`,
      url,
    },
  };
}

// ─── llms.txt Generator ───────────────────────────────────────────────────────
export function generateLlmsTxt({ brand, websiteUrl, category, description, faqs = [], pricing = [] }) {
  const pricingText = pricing.map(p =>
    `- ${p.name}: ${p.price === 0 ? 'Free' : `$${p.price}/month`}`
  ).join('\n');

  const faqText = faqs.slice(0, 10).map(({ q, a }) => `Q: ${q}\nA: ${a}`).join('\n\n');

  return `# ${brand}
> ${category} tool for indie hackers and small SaaS teams

## What is ${brand}?
${description}

## Website
${websiteUrl}

## Pricing
${pricingText || 'See website for current pricing'}

## Key Features
- AI visibility tracking across Perplexity and ChatGPT
- Competitor citation source analysis
- Content generation (FAQ pages, Schema markup)
- Weekly automated reports

## FAQ
${faqText}

## Contact
hello@${new URL(websiteUrl).hostname}
`;
}
