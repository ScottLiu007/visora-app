// visora/mvp/src/scanner.js
// Core GEO visibility scanner — Week 1 MVP
// Sends question set to Perplexity, parses brand mentions + citation sources

import OpenAI from 'openai';
import { writeFileSync } from 'fs';
import { scoreResults } from './scorer.js';
import { runFullAnalysis } from './analyzer.js';

// ─── Config ─────────────────────────────────────────────────────────────────
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || process.env.OPENROUTER_API_KEY;
const USE_OPENROUTER = !!process.env.OPENROUTER_API_KEY;

const client = new OpenAI({
  baseURL: USE_OPENROUTER
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.perplexity.ai',
  apiKey: PERPLEXITY_API_KEY,
  defaultHeaders: USE_OPENROUTER ? {
    'HTTP-Referer': 'https://visoraapp.com',
    'X-Title': 'Visora GEO Scanner',
  } : {},
});

const MODEL = USE_OPENROUTER ? 'perplexity/sonar' : 'sonar';

// ─── Question Templates ──────────────────────────────────────────────────────
// These are dynamically generated based on category + brand
function buildQuestions(category, targetBrand, competitors) {
  const allBrands = [targetBrand, ...competitors];
  return [
    `What are the best ${category} tools for small businesses?`,
    `What ${category} software do indie hackers recommend?`,
    `Best ${category} tools in 2026?`,
    `What ${category} tool should I use for my startup?`,
    `How do I choose a ${category} tool?`,
    `What are the top ${category} platforms?`,
    `Free ${category} tools worth trying?`,
    `${category} tools comparison 2026`,
    `Most popular ${category} software for teams?`,
    `Which ${category} tool has the best free plan?`,
    // Brand-specific
    ...allBrands.slice(0, 3).map(b => `${b} alternatives`),
    ...allBrands.slice(0, 2).map(b => `Is ${b} worth it?`),
    `Best ${category} tools for SaaS companies`,
    `${category} tools for developers`,
    `${category} software with API access`,
    `Affordable ${category} tools`,
    `${category} tools under $50 per month`,
    `Enterprise ${category} software`,
    `Open source ${category} tools`,
  ];
}

// ─── Core Scanner ────────────────────────────────────────────────────────────
export async function scanBrand({
  targetBrand,
  websiteUrl,
  category,
  competitors = [],
  questionLimit = 10, // use 50 in production
}) {
  const questions = buildQuestions(category, targetBrand, competitors)
    .slice(0, questionLimit);

  const allBrands = [targetBrand, ...competitors];
  const results = [];

  console.log(`\n🔍 Scanning AI visibility for: ${targetBrand}`);
  console.log(`📊 Category: ${category}`);
  console.log(`🏁 Competitors: ${competitors.join(', ') || 'none'}`);
  console.log(`❓ Questions: ${questions.length}\n`);

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`[${i + 1}/${questions.length}] ${question}`);

    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: question }],
        max_tokens: 1024,
      });

      const text = response.choices[0].message.content;
      const mentions = countMentions(text, allBrands);
      const sources = extractSources(text);

      results.push({ question, text, mentions, sources });

      const found = Object.entries(mentions)
        .filter(([, n]) => n > 0)
        .map(([b, n]) => `${b}(${n})`)
        .join(', ') || '—';
      console.log(`  ✅ Citations: ${found}`);
      if (sources.length > 0) {
        console.log(`  🔗 Sources: ${sources.slice(0, 3).join(', ')}`);
      }

    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      results.push({ question, error: err.message });
    }

    // Rate limit: 800ms between requests
    await new Promise(r => setTimeout(r, 800));
  }

  const report = generateReport({ targetBrand, category, competitors, results });

  // Add scoring + analysis
  const scoreData = scoreResults({
    targetBrand,
    results,
    topSources: report.topCitationSources,
  });
  report.visibilityScore = scoreData.score;
  report.scoreGrade = scoreData.grade;
  report.scoreInsight = scoreData.insight;
  report.scoreBreakdown = scoreData.breakdown;

  const analysis = runFullAnalysis({
    targetBrand, competitors, results,
    topSources: report.topCitationSources,
    targetScore: scoreData.score,
  });
  report.actions = analysis.actions;
  report.gapCount = analysis.gaps.length;

  return report;
}

// ─── Mention Counter ─────────────────────────────────────────────────────────
function countMentions(text, brands) {
  const result = {};
  const lower = text.toLowerCase();
  for (const brand of brands) {
    const matches = lower.match(new RegExp(brand.toLowerCase(), 'g'));
    result[brand] = matches ? matches.length : 0;
  }
  return result;
}

// ─── Source Extractor ────────────────────────────────────────────────────────
function extractSources(text) {
  const urlRegex = /https?:\/\/[^\s\)\]\"<]+/g;
  const raw = text.match(urlRegex) || [];
  return [...new Set(raw)].filter(url => {
    try { new URL(url); return true; } catch { return false; }
  });
}

// ─── Report Generator ────────────────────────────────────────────────────────
function generateReport({ targetBrand, category, competitors, results }) {
  const allBrands = [targetBrand, ...competitors];
  const totals = {};

  for (const brand of allBrands) {
    totals[brand] = { citations: 0, appearances: 0 };
  }

  const allSources = [];

  for (const result of results) {
    if (result.error) continue;
    for (const [brand, count] of Object.entries(result.mentions || {})) {
      if (totals[brand]) {
        totals[brand].citations += count;
        if (count > 0) totals[brand].appearances++;
      }
    }
    if (result.sources) allSources.push(...result.sources);
  }

  // Citation source domain frequency
  const domainCounts = {};
  for (const src of allSources) {
    try {
      const domain = new URL(src).hostname.replace('www.', '');
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    } catch {}
  }
  const topSources = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  // AI Visibility Score (0-100)
  const totalQuestions = results.filter(r => !r.error).length;
  const targetScore = totalQuestions > 0
    ? Math.round((totals[targetBrand].appearances / totalQuestions) * 100)
    : 0;

  const report = {
    brand: targetBrand,
    category,
    scanDate: new Date().toISOString(),
    totalQuestions,
    visibilityScore: targetScore,
    brandTotals: totals,
    topCitationSources: topSources,
    raw: results,
  };

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VISORA AI VISIBILITY REPORT');
  console.log('='.repeat(60));
  console.log(`Brand: ${targetBrand} | Category: ${category}`);
  console.log(`Questions: ${totalQuestions} | Date: ${new Date().toLocaleDateString()}\n`);

  console.log('── Visibility Scores ──');
  for (const [brand, data] of Object.entries(totals)) {
    const score = totalQuestions > 0
      ? Math.round((data.appearances / totalQuestions) * 100)
      : 0;
    const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));
    const marker = brand === targetBrand ? ' ◀ YOUR BRAND' : '';
    console.log(`${brand.padEnd(20)} ${bar} ${score}%${marker}`);
  }

  if (topSources.length > 0) {
    console.log('\n── Top Citation Sources ──');
    for (const [domain, count] of topSources.slice(0, 10)) {
      console.log(`  ${String(count).padStart(3)}x  ${domain}`);
    }
  }

  // Gap analysis
  const topCompetitor = competitors
    .map(c => ({ brand: c, score: Math.round((totals[c]?.appearances || 0) / totalQuestions * 100) }))
    .sort((a, b) => b.score - a.score)[0];

  console.log('\n── Diagnosis ──');
  if (targetScore === 0) {
    console.log(`❌ ${targetBrand} is essentially invisible to AI search.`);
    console.log('   Priority: Get listed on G2/Capterra, create FAQ page with schema markup.');
  } else if (topCompetitor && targetScore < topCompetitor.score / 2) {
    console.log(`⚠️  ${targetBrand} visibility is significantly lower than ${topCompetitor.brand}.`);
    console.log(`   Gap: ${topCompetitor.score - targetScore}% points to close.`);
  } else {
    console.log(`✅ ${targetBrand} has competitive AI visibility.`);
  }
  console.log('');

  return report;
}

// ─── CLI Entry Point ─────────────────────────────────────────────────────────
if (process.argv[1].includes('scanner.js')) {
  // Example: node src/scanner.js
  const report = await scanBrand({
    targetBrand: 'Visora',
    websiteUrl: 'https://visoraapp.com',
    category: 'GEO optimization',
    competitors: ['Otterly', 'Rankscale', 'Peec'],
    questionLimit: 10,
  });

  // Save report
  const filename = `scan-${Date.now()}.json`;
  writeFileSync(filename, JSON.stringify(report, null, 2));

  // Print actions
  if (report.actions?.length > 0) {
    console.log('── Top 3 Actions ──');
    report.actions.forEach((a, i) => {
      console.log(`  ${i + 1}. [${a.effort}] ${a.title}`);
      console.log(`     ${a.reason}`);
    });
  }

  console.log(`\n💾 Full report saved: ${filename}`);
}
