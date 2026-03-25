// visora/mvp/api/scan.js
// POST /api/scan — trigger a brand visibility scan

import { Router } from 'express';
import { scanBrand } from '../src/scanner.js';
import { scoreResults } from '../src/scorer.js';
import { runFullAnalysis } from '../src/analyzer.js';
import { generateLlmsTxt } from '../src/generator.js';
import { createClient } from '@supabase/supabase-js';

export const scanRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// ─── Helper: transform raw output → ScanReport shape (matches frontend types) ─
function buildScanReport({ scanId, userId, targetBrand, websiteUrl, category, competitors, scoreData, analysis, rawResults, createdAt, llmsTxt }) {
  const PRIORITY_MAP = { 1: 'high', 2: 'medium', 3: 'low' };

  // score_breakdown: flat numbers 0-100 + weights for UI explanation
  const score_breakdown = {
    appearance_rate:  scoreData.breakdown?.appearanceRate?.score  ?? 0,
    citation_density: scoreData.breakdown?.mentionDensity?.score  ?? 0,
    sentiment:        scoreData.breakdown?.sentiment?.score       ?? 0,
    source_quality:   scoreData.breakdown?.sourceQuality?.score   ?? 0,
    // weights for "how we scored you" UI
    weights: { appearance_rate: 0.50, citation_density: 0.20, sentiment: 0.15, source_quality: 0.15 },
    // raw stats for transparency
    stats: {
      appearances: scoreData.stats?.appearances ?? 0,
      total_questions: scoreData.stats?.totalQ ?? 0,
      total_mentions: scoreData.stats?.totalMentions ?? 0,
    },
  };

  // citation_gaps: group by competitor (from per-question gaps array)
  const gapMap = {};
  for (const comp of competitors) {
    gapMap[comp] = { hits: 0, sources: new Set() };
  }
  for (const gap of analysis.gaps || []) {
    for (const hit of gap.competitorHits || []) {
      if (gapMap[hit.brand]) {
        gapMap[hit.brand].hits += 1;
        (gap.sources || []).forEach(s => gapMap[hit.brand].sources.add(s));
      }
    }
  }
  const totalQ = scoreData.stats?.totalQ || 1;
  const citation_gaps = competitors.map(comp => ({
    competitor: comp,
    sources:    [...(gapMap[comp]?.sources || [])].slice(0, 8),
    gap_score:  Math.min((gapMap[comp]?.hits || 0) / totalQ, 1),
  }));

  // action_items: normalize priority (1→'high') and rename reason→description
  const action_items = (analysis.actions || []).map(a => ({
    priority:    PRIORITY_MAP[a.priority] || 'medium',
    title:       a.title,
    description: a.reason || '',
    impact:      a.impact || '',
    url:         a.url || null,
  }));

  // scan_questions: each prompt + whether brand was mentioned (for transparency UI)
  const scan_questions = (rawResults || [])
    .filter(r => !r.error)
    .map(r => ({
      question: r.question,
      brand_mentioned: (r.mentions?.[targetBrand] || 0) > 0,
      competitors_mentioned: competitors.filter(c => (r.mentions?.[c] || 0) > 0),
    }));

  return {
    id:          scanId || null,
    user_id:     userId || null,
    target_brand:  targetBrand,
    website_url:   websiteUrl,
    category,
    keywords:      keywords || null,
    competitors,
    score:            scoreData.score,
    score_breakdown,
    citation_gaps,
    action_items,
    scan_questions,
    generated_content: {
      llms_txt: llmsTxt || null,
    },
    // competitor source attribution: { "Otterly": [["reddit.com", 3], ...] }
    competitor_sources: analysis.competitorSources || {},
    created_at: createdAt || new Date().toISOString(),
    status: 'complete',
  };
}

// ─── POST /api/scan ───────────────────────────────────────────────────────────
scanRouter.post('/', async (req, res) => {
  const { targetBrand, websiteUrl, category, keywords, competitors = [], questionLimit = 10, userId } = req.body;

  if (!targetBrand || !category) {
    return res.status(400).json({ error: 'targetBrand and category are required' });
  }
  if (competitors.length > 5) {
    return res.status(400).json({ error: 'Maximum 5 competitors per scan' });
  }

  // ─── Paywall check ───────────────────────────────────────────────────────────
  if (userId && process.env.SUPABASE_URL) {
    const { data: profile } = await supabase.from('profiles').select('plan, scan_credits').eq('id', userId).single();
    const plan = profile?.plan || 'starter';
    const credits = profile?.scan_credits ?? 1;

    if (plan === 'starter' && credits <= 0) {
      return res.status(402).json({
        error: 'upgrade_required',
        message: 'You have used your free scan. Upgrade to run more scans.',
        upgrade_url: 'https://visoraapp.com/#pricing',
      });
    }
  }

  // Insert scan record (status: running)
  let scanId;
  let createdAt = new Date().toISOString();
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase.from('scans').insert({
      user_id:      userId || null,
      target_brand: targetBrand,
      website_url:  websiteUrl,
      category,
      competitors,
      status: 'running',
    }).select('id, created_at').single();

    if (error) console.error('Supabase insert error:', error);
    else { scanId = data?.id; createdAt = data?.created_at || createdAt; }
  }

  // Run scan
  try {
    console.log(`\n▶ Scan started: ${targetBrand} | ${category}`);

    const rawReport = await scanBrand({
      targetBrand, websiteUrl, category, keywords, competitors,
      questionLimit: Math.min(questionLimit, 50),
    });

    const scoreData = scoreResults({
      targetBrand,
      results:    rawReport.raw,
      topSources: rawReport.topCitationSources,
    });

    const analysis = runFullAnalysis({
      targetBrand,
      competitors,
      results:     rawReport.raw,
      topSources:  rawReport.topCitationSources,
      targetScore: scoreData.score,
    });

    // Generate llms.txt (template-based, no API call needed)
    const llmsTxt = generateLlmsTxt({
      brand: targetBrand,
      websiteUrl: websiteUrl || `https://example.com`,
      category,
      description: `${targetBrand} is a ${category} tool.`,
      pricing: [{ name: 'Free', price: 0 }, { name: 'Pro', price: 29 }],
    });

    const report = buildScanReport({
      scanId, userId, targetBrand, websiteUrl, category, competitors,
      scoreData, analysis, rawResults: rawReport.raw, llmsTxt, createdAt,
    });

    // Persist to Supabase
    if (scanId && process.env.SUPABASE_URL) {
      await supabase.from('scans').update({
        status:           'complete',
        visibility_score: scoreData.score,
        report_json:      report,
        completed_at:     new Date().toISOString(),
      }).eq('id', scanId);
    }

    // Decrement starter credits after successful scan
    if (userId && process.env.SUPABASE_URL) {
      const { data: profile } = await supabase.from('profiles').select('plan, scan_credits').eq('id', userId).single();
      if (profile?.plan === 'starter' && (profile?.scan_credits ?? 0) > 0) {
        await supabase.from('profiles').update({ scan_credits: profile.scan_credits - 1 }).eq('id', userId);
      }
    }

    // ✅ Return scanId — frontend navigates to /dashboard/report/:scanId
    res.json({ scanId, success: true });

  } catch (err) {
    console.error('Scan error:', err);
    if (scanId && process.env.SUPABASE_URL) {
      await supabase.from('scans').update({
        status: 'error',
        error_message: err.message,
      }).eq('id', scanId);
    }
    res.status(500).json({ error: 'Scan failed', message: err.message });
  }
});
