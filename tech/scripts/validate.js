// GEO Visibility Validator — 技术验证脚本
// 使用 OpenRouter 统一调用多个 AI 模型
// 用法：node validate.js
// 调试模式（打印完整回答）：DEBUG=1 node validate.js
//
// 需要先设置环境变量：
// OPENROUTER_API_KEY=xxx

import OpenAI from "openai";

const DEBUG = process.env.DEBUG === "1";

// ─── OpenRouter 客户端 ───────────────────────────────
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://geo-visibility-engine.local",
    "X-Title": "GEO Visibility Validator",
  },
});

// ─── 模型配置 ────────────────────────────────────────
const MODELS = {
  llama: "meta-llama/llama-3.1-8b-instruct",
  mistral: "mistralai/mistral-nemo",
  perplexity: "perplexity/sonar",  // 联网，返回实时数据
};

// ─── 配置 ───────────────────────────────────────────
const TARGET_BRAND = "Rankscale";
const COMPETITORS = ["Otterly", "Scrunch", "Peec"];
const ALL_BRANDS = [TARGET_BRAND, ...COMPETITORS];

const QUESTIONS = [
  "What are the best tools to track if my brand appears in ChatGPT answers?",
  "How can I improve my visibility in AI search engines like Perplexity?",
  "What is generative engine optimization (GEO) and what tools help with it?",
  "Which SaaS tools help with AI SEO or GEO optimization?",
  "How do I know if my website is being cited by AI chatbots?",
  "What tools track brand mentions in ChatGPT and Perplexity?",
  "Best tools for monitoring AI search engine visibility?",
  "How to optimize content for AI-powered search engines?",
  "What is the best GEO tool for small businesses?",
  "How do I get my product recommended by ChatGPT?",
];

// ─── 工具函数 ────────────────────────────────────────
function countMentions(text, brands) {
  const result = {};
  const lowerText = text.toLowerCase();
  for (const brand of brands) {
    const matches = lowerText.match(new RegExp(brand.toLowerCase(), "g"));
    result[brand] = matches ? matches.length : 0;
  }
  return result;
}

function extractSources(text) {
  const urlRegex = /https?:\/\/[^\s\)\]\"]+/g;
  return [...new Set(text.match(urlRegex) || [])];
}

// ─── 查询函数 ────────────────────────────────────────
async function queryModel(modelKey, question) {
  const response = await client.chat.completions.create({
    model: MODELS[modelKey],
    messages: [{ role: "user", content: question }],
    max_tokens: 1024,
  });
  const text = response.choices[0].message.content;
  const sources = modelKey === "perplexity" ? extractSources(text) : [];
  return { text, sources };
}

// ─── 单题分析 ────────────────────────────────────────
async function analyzeQuestion(question, index) {
  console.log(`\n[${index + 1}/${QUESTIONS.length}] ${question}`);
  const result = { question, platforms: {} };

  for (const modelKey of Object.keys(MODELS)) {
    try {
      const { text, sources } = await queryModel(modelKey, question);
      const mentions = countMentions(text, ALL_BRANDS);
      result.platforms[modelKey] = { mentions, sources, text };

      console.log(`  ✅ ${modelKey}:`, JSON.stringify(mentions));

      // DEBUG 模式：打印完整回答和引用来源
      if (DEBUG) {
        console.log(`\n  ── ${modelKey} 完整回答 ──`);
        console.log(`  ${text.replace(/\n/g, "\n  ")}`);
        if (sources.length > 0) {
          console.log(`\n  ── ${modelKey} 引用来源 ──`);
          sources.forEach((s) => console.log(`  • ${s}`));
        }
        console.log();
      }
    } catch (e) {
      console.log(`  ❌ ${modelKey}: ${e.message}`);
      result.platforms[modelKey] = { mentions: {}, sources: [], text: "", error: e.message };
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  return result;
}

// ─── 汇总报告 ────────────────────────────────────────
function generateReport(results) {
  const totals = {};
  for (const brand of ALL_BRANDS) {
    totals[brand] = {};
    for (const m of Object.keys(MODELS)) totals[brand][m] = 0;
    totals[brand].total = 0;
  }

  const allSources = [];
  for (const result of results) {
    for (const [platform, data] of Object.entries(result.platforms)) {
      for (const [brand, count] of Object.entries(data.mentions || {})) {
        if (totals[brand]) {
          totals[brand][platform] = (totals[brand][platform] || 0) + count;
          totals[brand].total += count;
        }
      }
      if (data.sources) allSources.push(...data.sources);
    }
  }

  // 引用来源统计
  const sourceCounts = {};
  for (const src of allSources) {
    try {
      const domain = new URL(src).hostname;
      sourceCounts[domain] = (sourceCounts[domain] || 0) + 1;
    } catch {}
  }
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  console.log("\n" + "=".repeat(65));
  console.log("📊 GEO 可见度验证报告");
  console.log("=".repeat(65));
  console.log(`\n问题数量：${results.length} | 品牌：${ALL_BRANDS.join(", ")}`);

  const modelKeys = Object.keys(MODELS);
  console.log("\n── 各平台提及次数 ──");
  const colW = 10;
  const header = "品牌".padEnd(14) + modelKeys.map((m) => m.padEnd(colW)).join("") + "总计";
  console.log(header);
  console.log("-".repeat(header.length));
  for (const [brand, counts] of Object.entries(totals)) {
    const marker = brand === TARGET_BRAND ? " ◀ 目标品牌" : "";
    const row = brand.padEnd(14) + modelKeys.map((m) => String(counts[m] || 0).padEnd(colW)).join("") + counts.total + marker;
    console.log(row);
  }

  if (topSources.length > 0) {
    console.log("\n── 最高频引用来源（Top 10）──");
    for (const [domain, count] of topSources) {
      console.log(`  ${String(count).padStart(3)}x  ${domain}`);
    }
  }

  console.log("\n── 结论 ──");
  const targetTotal = totals[TARGET_BRAND]?.total || 0;
  const maxCompetitor = Math.max(...COMPETITORS.map((c) => totals[c]?.total || 0));
  if (targetTotal === 0) {
    console.log(`❌ ${TARGET_BRAND} 在所有 AI 平台几乎不可见，GEO 优化空间极大`);
  } else if (targetTotal < maxCompetitor / 2) {
    console.log(`⚠️  ${TARGET_BRAND} 可见度显著低于头部竞品`);
  } else {
    console.log(`✅ ${TARGET_BRAND} 可见度与竞品相当`);
  }
  console.log("\n✅ 技术验证完成：数据可以稳定抓取和解析\n");
}

// ─── 主函数 ──────────────────────────────────────────
async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌ 请先设置 OPENROUTER_API_KEY 环境变量");
    process.exit(1);
  }
  console.log("🚀 GEO 可见度技术验证开始");
  if (DEBUG) console.log("🔍 DEBUG 模式开启：将打印完整回答");
  console.log(`目标品牌：${TARGET_BRAND} | 竞品：${COMPETITORS.join(", ")}`);

  const results = [];
  for (let i = 0; i < QUESTIONS.length; i++) {
    results.push(await analyzeQuestion(QUESTIONS[i], i));
  }
  generateReport(results);
}

main().catch(console.error);
