// visora/mvp/src/index.js
// Express API server — Visora MVP backend

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { scanRouter } from '../api/scan.js';
import { reportRouter } from '../api/report.js';
import { waitlistRouter } from '../api/waitlist.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || ['http://localhost:3000', 'https://visoraapp.com'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${ms}ms`);
  });
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/scan', scanRouter);
app.use('/api/report', reportRouter);
app.use('/api/waitlist', waitlistRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Visora API running on http://localhost:${PORT}`);
  console.log(`   Scanner: ${process.env.OPENROUTER_API_KEY ? 'OpenRouter ✅' : process.env.PERPLEXITY_API_KEY ? 'Perplexity ✅' : '⚠️  No API key set'}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✅' : '⚠️  Not configured'}\n`);
});

export default app;
