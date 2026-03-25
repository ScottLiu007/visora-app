// visora/mvp/api/cron.js — scheduled jobs (weekly auto-scan for Growth)

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { runScanPipeline } from '../src/executeScan.js';
import { sendScanResultEmail } from '../src/email.js';

export const cronRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

function verifyCronSecret(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const header = req.headers['x-visora-cron'] || '';
  return bearer === secret || header === secret;
}

async function getPreviousScore(userId, targetBrand, excludeScanId) {
  const { data } = await supabase
    .from('scans')
    .select('visibility_score, report_json')
    .eq('user_id', userId)
    .eq('target_brand', targetBrand)
    .eq('status', 'complete')
    .neq('id', excludeScanId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data?.visibility_score != null) return data.visibility_score;
  if (data?.report_json?.score != null) return data.report_json.score;
  return null;
}

/**
 * POST /api/cron/weekly-auto-scan
 * Run weekly GEO scans for all Growth users with a saved weekly_scan_config.
 * Call from VPS cron: curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://api.visoraapp.com/api/cron/weekly-auto-scan
 */
cronRouter.post('/weekly-auto-scan', async (req, res) => {
  if (!verifyCronSecret(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, email_notifications, weekly_scan_config, plan')
    .eq('plan', 'growth')
    .not('weekly_scan_config', 'is', null);

  if (error) {
    console.error('cron weekly scan:', error);
    return res.status(500).json({ error: error.message });
  }

  const results = [];
  const base = process.env.PUBLIC_DASHBOARD_URL || 'https://dashboard.visoraapp.com';

  for (const p of profiles || []) {
    const cfg = p.weekly_scan_config;
    if (!cfg?.targetBrand || !cfg?.category) {
      results.push({ userId: p.id, skipped: true, reason: 'invalid_config' });
      continue;
    }

    const {
      targetBrand,
      websiteUrl,
      category,
      keywords,
      competitors = [],
    } = cfg;
    const comps = Array.isArray(competitors) ? competitors.filter(Boolean).slice(0, 5) : [];
    if (!comps.length) {
      results.push({ userId: p.id, skipped: true, reason: 'no_competitors' });
      continue;
    }

    let scanId;
    let createdAt = new Date().toISOString();
    const { data: row, error: insErr } = await supabase
      .from('scans')
      .insert({
        user_id: p.id,
        target_brand: targetBrand,
        website_url: websiteUrl || '',
        category,
        competitors: comps,
        status: 'running',
      })
      .select('id, created_at')
      .single();

    if (insErr) {
      console.error('cron insert scan failed', p.id, insErr);
      results.push({ userId: p.id, error: insErr.message });
      continue;
    }
    scanId = row.id;
    createdAt = row.created_at || createdAt;

    try {
      const prevScore = await getPreviousScore(p.id, targetBrand, scanId);

      const { report, scoreData } = await runScanPipeline({
        targetBrand,
        websiteUrl,
        category,
        keywords,
        competitors: comps,
        questionLimit: 10,
        scanId,
        userId: p.id,
        createdAt,
      });

      await supabase
        .from('scans')
        .update({
          status: 'complete',
          visibility_score: scoreData.score,
          report_json: report,
          completed_at: new Date().toISOString(),
        })
        .eq('id', scanId);

      await supabase
        .from('profiles')
        .update({ last_auto_scan_at: new Date().toISOString() })
        .eq('id', p.id);

      if (p.email_notifications !== false && p.email) {
        await sendScanResultEmail({
          to: p.email,
          brand: targetBrand,
          score: scoreData.score,
          prevScore,
          reportUrl: `${base}/dashboard/report/${scanId}`,
          isAuto: true,
        });
      }

      results.push({ userId: p.id, scanId, score: scoreData.score });
    } catch (e) {
      console.error('cron scan failed', p.id, e);
      await supabase
        .from('scans')
        .update({ status: 'error', error_message: e.message })
        .eq('id', scanId);
      results.push({ userId: p.id, error: e.message });
    }
  }

  res.json({ ok: true, processed: results.length, results });
});
