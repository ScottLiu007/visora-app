// visora/mvp/src/executeScan.js — shared scan pipeline (HTTP + cron)

import { scanBrand } from './scanner.js';
import { scoreResults } from './scorer.js';
import { runFullAnalysis } from './analyzer.js';
import { generateLlmsTxt } from './generator.js';
import { fetchCitationOpportunities } from './opportunities.js';

const PRIORITY_MAP = { 1: 'high', 2: 'medium', 3: 'low' };

export function buildScanReport({
  scanId,
  userId,
  targetBrand,
  websiteUrl,
  category,
  keywords,
  competitors,
  scoreData,
  analysis,
  rawResults,
  createdAt,
  llmsTxt,
  citation_opportunities,
}) {
  const score_breakdown = {
    appearance_rate: scoreData.breakdown?.appearanceRate?.score ?? 0,
    citation_density: scoreData.breakdown?.mentionDensity?.score ?? 0,
    sentiment: scoreData.breakdown?.sentiment?.score ?? 0,
    source_quality: scoreData.breakdown?.sourceQuality?.score ?? 0,
    weights: { appearance_rate: 0.50, citation_density: 0.20, sentiment: 0.15, source_quality: 0.15 },
    stats: {
      appearances: scoreData.stats?.appearances ?? 0,
      total_questions: scoreData.stats?.totalQ ?? 0,
      total_mentions: scoreData.stats?.totalMentions ?? 0,
    },
  };

  const gapMap = {};
  for (const comp of competitors) {
    gapMap[comp] = { hits: 0, sources: new Set() };
  }
  for (const gap of analysis.gaps || []) {
    for (const hit of gap.competitorHits || []) {
      if (gapMap[hit.brand]) {
        gapMap[hit.brand].hits += 1;
        (gap.sources || []).forEach((s) => gapMap[hit.brand].sources.add(s));
      }
    }
  }
  const totalQ = scoreData.stats?.totalQ || 1;
  const citation_gaps = competitors.map((comp) => ({
    competitor: comp,
    sources: [...(gapMap[comp]?.sources || [])].slice(0, 8),
    gap_score: Math.min((gapMap[comp]?.hits || 0) / totalQ, 1),
  }));

  const action_items = (analysis.actions || []).map((a) => ({
    priority: PRIORITY_MAP[a.priority] || 'medium',
    title: a.title,
    description: a.reason || '',
    impact: a.impact || '',
    url: a.url || null,
  }));

  const scan_questions = (rawResults || [])
    .filter((r) => !r.error)
    .map((r) => ({
      question: r.question,
      brand_mentioned: (r.mentions?.[targetBrand] || 0) > 0,
      competitors_mentioned: competitors.filter((c) => (r.mentions?.[c] || 0) > 0),
    }));

  return {
    id: scanId || null,
    user_id: userId || null,
    target_brand: targetBrand,
    website_url: websiteUrl,
    category,
    keywords: keywords || null,
    competitors,
    score: scoreData.score,
    score_breakdown,
    citation_gaps,
    action_items,
    scan_questions,
    citation_opportunities: citation_opportunities || [],
    generated_content: {
      llms_txt: llmsTxt || null,
    },
    competitor_sources: analysis.competitorSources || {},
    created_at: createdAt || new Date().toISOString(),
    status: 'complete',
  };
}

/**
 * Runs Perplexity questions + scoring + llms.txt + citation opportunities.
 */
export async function runScanPipeline({
  targetBrand,
  websiteUrl,
  category,
  keywords,
  competitors = [],
  questionLimit = 10,
  scanId,
  userId,
  createdAt,
}) {
  const rawReport = await scanBrand({
    targetBrand,
    websiteUrl,
    category,
    keywords,
    competitors,
    questionLimit: Math.min(questionLimit, 50),
  });

  const scoreData = scoreResults({
    targetBrand,
    results: rawReport.raw,
    topSources: rawReport.topCitationSources,
  });

  const analysis = runFullAnalysis({
    targetBrand,
    competitors,
    results: rawReport.raw,
    topSources: rawReport.topCitationSources,
    targetScore: scoreData.score,
  });

  const llmsTxt = generateLlmsTxt({
    brand: targetBrand,
    websiteUrl: websiteUrl || 'https://example.com',
    category,
    description: `${targetBrand} is a ${category} tool.`,
    pricing: [
      { name: 'Free', price: 0 },
      { name: 'Pro', price: 29 },
    ],
  });

  const citation_opportunities = await fetchCitationOpportunities({
    targetBrand,
    competitors,
    category,
    keywords,
  });

  const report = buildScanReport({
    scanId,
    userId,
    targetBrand,
    websiteUrl,
    category,
    keywords,
    competitors,
    scoreData,
    analysis,
    rawResults: rawReport.raw,
    createdAt,
    llmsTxt,
    citation_opportunities,
  });

  return { report, scoreData, rawReport };
}
