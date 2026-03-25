// visora/mvp/api/report.js
// GET /api/report/:id — retrieve a saved scan report
// GET /api/report/public/:token — public read-only (no auth)
// POST /api/report/:id/share — create or return share token (auth required)

import { Router } from 'express';
import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const reportRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// GET /api/report/public/:token — must be registered before /:id
reportRouter.get('/public/:token', async (req, res) => {
  const { token } = req.params;
  if (!token || token.length < 8) return res.status(400).json({ error: 'Invalid token' });

  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('share_token', token)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Report not found' });

  if (data.status === 'running' || data.status === 'pending') {
    return res.json({
      id: data.id,
      target_brand: data.target_brand,
      website_url: data.website_url,
      category: data.category,
      competitors: data.competitors || [],
      status: data.status,
      score: 0,
      score_breakdown: {
        appearance_rate: 0,
        citation_density: 0,
        sentiment: 0,
        source_quality: 0,
      },
      citation_gaps: [],
      action_items: [],
      generated_content: {},
      created_at: data.created_at,
    });
  }

  const report = data.report_json || {};
  res.json({
    ...report,
    id: data.id,
    status: data.status,
  });
});

// GET /api/report/user/:userId — list (before /:id)
reportRouter.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('scans')
    .select('id, target_brand, website_url, category, visibility_score, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return res.status(500).json({ error: error.message });
  const scans = (data || []).map((s) => ({
    ...s,
    score: s.visibility_score ?? 0,
  }));
  res.json({ success: true, scans });
});

// POST /api/report/:id/share — generate share link (owner only)
reportRouter.post('/:id/share', async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  const accessToken = authHeader.slice(7);

  const { data: userData, error: authErr } = await supabase.auth.getUser(accessToken);
  if (authErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const { data: scan, error } = await supabase
    .from('scans')
    .select('id, user_id, share_token')
    .eq('id', id)
    .single();

  if (error || !scan) return res.status(404).json({ error: 'Report not found' });
  if (scan.user_id !== userData.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  let token = scan.share_token;
  if (!token) {
    token = randomBytes(18).toString('base64url');
    await supabase.from('scans').update({ share_token: token }).eq('id', id);
  }

  const base = process.env.PUBLIC_DASHBOARD_URL || 'https://dashboard.visoraapp.com';
  res.json({
    shareUrl: `${base}/share/${token}`,
    token,
  });
});

// GET /api/report/:id
reportRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Report ID required' });

  if (!process.env.SUPABASE_URL) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Report not found' });

  if (data.status === 'running' || data.status === 'pending') {
    return res.json({
      id: data.id,
      user_id: data.user_id,
      target_brand: data.target_brand,
      website_url: data.website_url,
      category: data.category,
      competitors: data.competitors || [],
      status: data.status,
      score: 0,
      score_breakdown: {
        appearance_rate: 0,
        citation_density: 0,
        sentiment: 0,
        source_quality: 0,
      },
      citation_gaps: [],
      action_items: [],
      generated_content: {},
      created_at: data.created_at,
    });
  }

  const report = data.report_json || {};
  res.json({
    ...report,
    id: data.id,
    status: data.status,
  });
});
