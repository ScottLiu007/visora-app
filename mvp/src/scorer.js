// visora/mvp/src/scorer.js
// Weighted AI visibility scoring — beyond raw mention count
// Score factors: appearance rate, mention prominence, sentiment, recency signal

// ─── Weights ─────────────────────────────────────────────────────────────────
const WEIGHTS = {
  appearanceRate: 0.50,   // % of questions where brand appeared (most important)
  mentionDensity: 0.20,   // avg mentions per appearance (prominence)
  sentimentBonus: 0.15,   // positive context detection
  sourceQuality:  0.15,   // citation sources are high-authority domains
};

// High-authority domains that significantly boost GEO credibility
const AUTHORITY_DOMAINS = new Set([
  'g2.com', 'capterra.com', 'trustpilot.com', 'getapp.com', 'softwareadvice.com',
  'producthunt.com', 'alternativeto.net',
  'techcrunch.com', 'venturebeat.com', 'forbes.com', 'inc.com', 'wired.com',
  'reddit.com', 'news.ycombinator.com',
  'github.com', 'dev.to', 'medium.com',
]);

const POSITIVE_SIGNALS = [
  'recommend', 'best', 'top', 'excellent', 'popular', 'leading', 'trusted',
  'powerful', 'easy to use', 'affordable', 'great', 'love', 'impressive',
];
const NEGATIVE_SIGNALS = [
  'avoid', 'bad', 'terrible', 'expensive', 'complex', 'poor', 'worst',
  'difficult', 'buggy', 'slow', 'unreliable',
];

// ─── Main Scorer ─────────────────────────────────────────────────────────────
export function scoreResults({ targetBrand, results, topSources }) {
  const validResults = results.filter(r => !r.error);
  const totalQ = validResults.length;

  if (totalQ === 0) return { score: 0, breakdown: {}, grade: 'F', insight: 'No data' };

  // 1. Appearance rate (0–100)
  const appearances = validResults.filter(r =>
    (r.mentions?.[targetBrand] || 0) > 0
  ).length;
  const appearanceRate = appearances / totalQ;
  const appearanceScore = Math.round(appearanceRate * 100);

  // 2. Mention density — avg mentions per appearance (capped at 3)
  const totalMentions = validResults.reduce((sum, r) => sum + (r.mentions?.[targetBrand] || 0), 0);
  const avgMentions = appearances > 0 ? totalMentions / appearances : 0;
  const densityScore = Math.min(Math.round((avgMentions / 3) * 100), 100);

  // 3. Sentiment analysis around brand mentions
  const sentimentScore = analyzeSentiment(targetBrand, validResults);

  // 4. Source quality score
  const sourceScore = scoreSourceQuality(topSources);

  // ── Weighted composite ──
  const composite = Math.round(
    appearanceScore * WEIGHTS.appearanceRate +
    densityScore    * WEIGHTS.mentionDensity +
    sentimentScore  * WEIGHTS.sentimentBonus +
    sourceScore     * WEIGHTS.sourceQuality
  );

  const grade = getGrade(composite);
  const insight = getInsight(composite, appearanceScore, sourceScore);

  return {
    score: composite,
    grade,
    insight,
    breakdown: {
      appearanceRate: { raw: appearanceRate, score: appearanceScore, weight: WEIGHTS.appearanceRate },
      mentionDensity: { raw: avgMentions.toFixed(2), score: densityScore, weight: WEIGHTS.mentionDensity },
      sentiment:      { score: sentimentScore, weight: WEIGHTS.sentimentBonus },
      sourceQuality:  { score: sourceScore, weight: WEIGHTS.sourceQuality },
    },
    stats: { appearances, totalQ, totalMentions },
  };
}

// ─── Sentiment Analyzer ───────────────────────────────────────────────────────
function analyzeSentiment(brand, results) {
  let positiveHits = 0;
  let negativeHits = 0;
  let totalHits = 0;

  for (const r of results) {
    if (!r.mentions?.[brand] || r.mentions[brand] === 0) continue;
    const text = r.text.toLowerCase();
    // Find sentences containing the brand
    const sentences = text.split(/[.!?]/).filter(s => s.includes(brand.toLowerCase()));
    for (const sentence of sentences) {
      totalHits++;
      if (POSITIVE_SIGNALS.some(s => sentence.includes(s))) positiveHits++;
      if (NEGATIVE_SIGNALS.some(s => sentence.includes(s))) negativeHits++;
    }
  }

  if (totalHits === 0) return 50; // neutral
  const ratio = (positiveHits - negativeHits * 1.5) / totalHits;
  return Math.max(0, Math.min(100, Math.round(50 + ratio * 50)));
}

// ─── Source Quality Scorer ────────────────────────────────────────────────────
function scoreSourceQuality(topSources = []) {
  if (topSources.length === 0) return 0;
  const authorityCount = topSources.filter(([domain]) => AUTHORITY_DOMAINS.has(domain)).length;
  const ratio = authorityCount / Math.min(topSources.length, 10);
  return Math.round(ratio * 100);
}

// ─── Grade + Insight ──────────────────────────────────────────────────────────
function getGrade(score) {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 45) return 'C';
  if (score >= 25) return 'D';
  return 'F';
}

function getInsight(score, appearanceScore, sourceScore) {
  if (score === 0) return 'Completely invisible to AI search. Start with G2 submission and an FAQ page.';
  if (appearanceScore < 20) return 'Very low AI visibility. Focus on third-party platform presence first.';
  if (sourceScore < 30) return 'Citations exist but lack authority. Target G2, Capterra, and media coverage.';
  if (score < 45) return 'Below-average visibility. Need consistent content and community presence.';
  if (score < 65) return 'Moderate visibility. Competitor citation gap analysis will reveal next steps.';
  if (score < 80) return 'Good visibility. Focus on maintaining quality and expanding citation sources.';
  return 'Excellent AI visibility. Monitor for algorithm changes and protect citation sources.';
}
