// visora/mvp/api/report.js
// GET /api/report/:id — retrieve a saved scan report

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

export const reportRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// GET /api/report/:id
// Returns ScanReport shape directly (no {success, report} wrapper)
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

  // If scan is still running, return minimal shape with status
  if (data.status === 'running' || data.status === 'pending') {
    return res.json({
      id:           data.id,
      user_id:      data.user_id,
      target_brand: data.target_brand,
      website_url:  data.website_url,
      category:     data.category,
      competitors:  data.competitors || [],
      status:       data.status,
      score:        0,
      score_breakdown: { appearance_rate: 0, citation_density: 0, sentiment: 0, source_quality: 0 },
      citation_gaps:   [],
      action_items:    [],
      generated_content: {},
      created_at:   data.created_at,
    });
  }

  // Return stored report_json (already in ScanReport shape) with live status
  const report = data.report_json || {};
  res.json({
    ...report,
    id:     data.id,
    status: data.status,
  });
});

// GET /api/report/user/:userId — list all scans for a user
reportRouter.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('scans')
    .select('id, target_brand, website_url, category, visibility_score, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return res.status(500).json({ error: error.message });
  // Map visibility_score → score to match ScanReport interface
  const scans = (data || []).map(s => ({
    ...s,
    score: s.visibility_score ?? 0,
  }));
  res.json({ success: true, scans });
});
