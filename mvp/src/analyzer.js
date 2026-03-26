// visora/mvp/src/analyzer.js
// Competitor citation gap analysis
// "Why do competitors appear while you don't?" — the core Visora value prop

// ─── Citation Gap Analysis ────────────────────────────────────────────────────
// Identifies questions where competitor appeared but target did NOT
export function analyzeCitationGaps({ targetBrand, competitors, results }) {
  const validResults = results.filter(r => !r.error);

  const gaps = []; // questions where a competitor appeared but target didn't

  for (const result of validResults) {
    const targetMentioned = (result.mentions?.[targetBrand] || 0) > 0;
    if (targetMentioned) continue; // no gap here

    const competitorHits = competitors
      .filter(c => (result.mentions?.[c] || 0) > 0)
      .map(c => ({ brand: c, count: result.mentions[c] }));

    if (competitorHits.length > 0) {
      gaps.push({
        question: result.question,
        competitorHits,
        sources: result.sources || [],
      });
    }
  }

  return gaps;
}

// ─── Source Attribution ────────────────────────────────────────────────────────
// For each competitor, which sources are driving their citations?
export function attributeSources({ competitors, results }) {
  const competitorSources = {};

  for (const competitor of competitors) {
    competitorSources[competitor] = {};
  }

  for (const result of results) {
    if (result.error || !result.sources?.length) continue;
    for (const competitor of competitors) {
      if ((result.mentions?.[competitor] || 0) === 0) continue;
      for (const url of result.sources) {
        try {
          const domain = new URL(url).hostname.replace('www.', '');
          competitorSources[competitor][domain] =
            (competitorSources[competitor][domain] || 0) + 1;
        } catch {}
      }
    }
  }

  // Sort each competitor's sources by frequency
  const ranked = {};
  for (const [competitor, domains] of Object.entries(competitorSources)) {
    ranked[competitor] = Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }
  return ranked;
}

// ─── Action Recommendations ───────────────────────────────────────────────────
// Generate 3 concrete, prioritized actions based on gap analysis
export function generateActions({ targetBrand, gaps, competitorSources, targetScore }) {
  // Brand is completely invisible — return full GTM-first action set
  if (targetScore < 10) {
    return [
      {
        priority: 1,
        type: 'platform',
        title: `List ${targetBrand} on G2`,
        reason: 'AI search engines heavily cite G2 reviews. Having zero G2 presence is the #1 reason new products are invisible to AI — it takes 1-2 hours and starts showing results within 2-4 weeks.',
        effort: 'Low (1-2 hours)',
        impact: 'High — visible in 2-4 weeks',
        url: 'https://www.g2.com/products/new',
      },
      {
        priority: 2,
        type: 'launch',
        title: `Launch ${targetBrand} on Product Hunt`,
        reason: 'Product Hunt is one of the most frequently cited sources by Perplexity and ChatGPT. A launch day post creates an indexable, authoritative page AI can reference immediately.',
        effort: 'Low (2-3 hours to prepare)',
        impact: 'High — AI-indexable within 1 week',
        url: 'https://www.producthunt.com/posts/new',
      },
      {
        priority: 3,
        type: 'entity',
        title: `Create a Wikidata entity for ${targetBrand}`,
        reason: 'Wikidata is part of the Google Knowledge Graph. When AI models have a structured entity entry for your brand, they can confidently cite you by name. Takes 20 minutes.',
        effort: 'Low (20 min)',
        impact: 'Medium — improves entity recognition in AI within weeks',
        url: 'https://www.wikidata.org/wiki/Special:NewItem',
      },
      {
        priority: 4,
        type: 'directory',
        title: `Submit ${targetBrand} to Futurepedia and AI directories`,
        reason: 'AI tool directories like Futurepedia and There\'s An AI For That are frequently cited by Perplexity when users ask about AI-adjacent tools. Free to submit, takes 30 minutes.',
        effort: 'Low (30 min)',
        impact: 'Medium — AI-indexable within 1-2 weeks',
        url: 'https://www.futurepedia.io/submit-tool',
      },
      {
        priority: 5,
        type: 'community',
        title: `Post about ${targetBrand} in r/SaaS or r/SEO`,
        reason: 'Reddit is one of the top citation sources for AI search engines. A genuine post sharing your product\'s story or GEO data creates a permanent, AI-citeable brand mention.',
        effort: 'Low (1-2 hours)',
        impact: 'Medium — AI-indexable within 1-2 weeks',
        url: 'https://www.reddit.com/r/SaaS/submit',
      },
      {
        priority: 6,
        type: 'social',
        title: `Share ${targetBrand}'s GEO data insights on LinkedIn`,
        reason: 'LinkedIn is heavily indexed by Perplexity and other AI search engines. A post sharing original data about AI visibility in your niche builds brand authority and citation probability.',
        effort: 'Low (1 hour)',
        impact: 'Medium — AI-indexable within days',
        url: 'https://www.linkedin.com/feed/',
      },
      {
        priority: 7,
        type: 'content',
        title: `Create a comparison page: ${targetBrand} vs competitors`,
        reason: 'Comparison pages are among the highest-cited content types by AI search engines. A well-structured "vs" page targeting your category creates a permanent AI-citation asset.',
        effort: 'Medium (2-3 hours)',
        impact: 'High — AI-indexable within 2-4 weeks',
      },
    ];
  }

  const actions = [];

  // Count which domains appear most in competitor citations
  const allCompetitorDomains = {};
  for (const domains of Object.values(competitorSources)) {
    for (const [domain, count] of domains) {
      allCompetitorDomains[domain] = (allCompetitorDomains[domain] || 0) + count;
    }
  }
  const topCompetitorDomains = Object.entries(allCompetitorDomains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d]) => d);

  // Action 1: Missing platform presence
  const REVIEW_PLATFORMS = [
    { domain: 'g2.com',         url: 'https://www.g2.com/products/new' },
    { domain: 'capterra.com',   url: 'https://www.capterra.com/vendors/sign-up' },
    { domain: 'producthunt.com',url: 'https://www.producthunt.com/posts/new' },
    { domain: 'trustpilot.com', url: 'https://business.trustpilot.com/signup' },
    { domain: 'getapp.com',     url: 'https://www.getapp.com/vendor-center/signup' },
  ];
  const missingPlatforms = REVIEW_PLATFORMS.filter(p => topCompetitorDomains.includes(p.domain));
  if (missingPlatforms.length > 0) {
    const names = missingPlatforms.slice(0, 2).map(p => p.domain.replace('.com', '')).join(' and ');
    actions.push({
      priority: 1,
      type: 'platform',
      title: `Get listed on ${names}`,
      reason: `These platforms appear in competitor citations but not yours. AI engines use them as trust signals — getting listed directly closes the citation gap.`,
      effort: 'Low (1-2 hours)',
      impact: 'High — visible in 2-4 weeks',
      url: missingPlatforms[0].url,
    });
  }

  // Action 2: Content gaps
  if (gaps.length > 0) {
    const gapQuestionTypes = detectGapPatterns(gaps);
    actions.push({
      priority: 2,
      type: 'content',
      title: `Create content targeting ${gapQuestionTypes} queries`,
      reason: `${targetBrand} was absent from ${gaps.length} queries where competitors appeared. Writing a comparison page or blog post targeting these exact queries is the fastest way to close the gap.`,
      effort: 'Medium (2-4 hours)',
      impact: 'Medium-High — visible in 3-6 weeks',
      sampleQuestions: gaps.slice(0, 3).map(g => g.question),
    });
  }

  // Action 3: FAQ schema or Reddit
  if (targetScore < 40) {
    actions.push({
      priority: 3,
      type: 'technical',
      title: 'Add FAQPage schema markup to your website',
      reason: 'Structured FAQ data is a direct AI citation signal. Add 5-8 Q&A pairs about your product as JSON-LD — this is one of the fastest technical wins.',
      effort: 'Low (1 hour)',
      impact: 'Medium — visible in 1-2 weeks',
    });
  } else {
    actions.push({
      priority: 3,
      type: 'authority',
      title: 'Build presence in relevant Reddit communities',
      reason: 'Reddit is one of the top AI citation sources. Sharing genuine insights or case studies in r/SaaS, r/SEO, or niche communities creates authoritative, AI-indexable mentions.',
      effort: 'Ongoing (1-2 hours/week)',
      impact: 'Medium — compounds over time',
      url: 'https://www.reddit.com/r/SaaS/',
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

// ─── Gap Pattern Detector ─────────────────────────────────────────────────────
function detectGapPatterns(gaps) {
  const q = gaps.map(g => g.question.toLowerCase()).join(' ');
  if (q.includes('alternative') || q.includes('vs ')) return '"alternative" and comparison';
  if (q.includes('best') || q.includes('top')) return '"best tools" and recommendation';
  if (q.includes('free') || q.includes('affordable')) return 'pricing and affordability';
  if (q.includes('small') || q.includes('startup') || q.includes('indie')) return 'small team and indie';
  return 'category-specific';
}

// ─── Full Analysis Pipeline ───────────────────────────────────────────────────
export function runFullAnalysis({ targetBrand, competitors, results, topSources, targetScore }) {
  const gaps = analyzeCitationGaps({ targetBrand, competitors, results });
  const competitorSources = attributeSources({ competitors, results });
  const actions = generateActions({ targetBrand, gaps, competitorSources, targetScore });

  return { gaps, competitorSources, actions };
}
