// visora/mvp/api/scan.js
// POST /api/scan — trigger a brand visibility scan

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { runScanPipeline } from '../src/executeScan.js';
import { sendScanResultEmail } from '../src/email.js';

export const scanRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

async function getPreviousScore(supabaseClient, userId, targetBrand, excludeScanId) {
  if (!userId || !supabaseClient) return null;
  const { data } = await supabaseClient
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

// ─── POST /api/scan ───────────────────────────────────────────────────────────
scanRouter.post('/', async (req, res) => {
  const {
    targetBrand,
    websiteUrl,
    category,
    keywords,
    competitors = [],
    questionLimit = 10,
    userId,
  } = req.body;

  if (!targetBrand || !category) {
    return res.status(400).json({ error: 'targetBrand and category are required' });
  }
  if (competitors.length > 5) {
    return res.status(400).json({ error: 'Maximum 5 competitors per scan' });
  }

  // ─── Paywall check ───────────────────────────────────────────────────────────
  if (userId && process.env.SUPABASE_URL) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, scan_credits')
      .eq('id', userId)
      .single();
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

  let scanId;
  let createdAt = new Date().toISOString();
  if (process.env.SUPABASE_URL) {
    const { data, error } = await supabase
      .from('scans')
      .insert({
        user_id: userId || null,
        target_brand: targetBrand,
        website_url: websiteUrl,
        category,
        competitors,
        status: 'running',
      })
      .select('id, created_at')
      .single();

    if (error) console.error('Supabase insert error:', error);
    else {
      scanId = data?.id;
      createdAt = data?.created_at || createdAt;
    }
  }

  try {
    console.log(`\n▶ Scan started: ${targetBrand} | ${category}`);

    const prevScore = scanId
      ? await getPreviousScore(supabase, userId, targetBrand, scanId)
      : null;

    const { report, scoreData } = await runScanPipeline({
      targetBrand,
      websiteUrl,
      category,
      keywords,
      competitors,
      questionLimit,
      scanId,
      userId,
      createdAt,
    });

    if (scanId && process.env.SUPABASE_URL) {
      await supabase
        .from('scans')
        .update({
          status: 'complete',
          visibility_score: scoreData.score,
          report_json: report,
          completed_at: new Date().toISOString(),
        })
        .eq('id', scanId);
    }

    if (userId && process.env.SUPABASE_URL) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, scan_credits, email, email_notifications')
        .eq('id', userId)
        .single();

      if (profile?.plan === 'starter' && (profile?.scan_credits ?? 0) > 0) {
        await supabase
          .from('profiles')
          .update({ scan_credits: profile.scan_credits - 1 })
          .eq('id', userId);
      }

      if (profile?.plan === 'growth') {
        await supabase
          .from('profiles')
          .update({
            weekly_scan_config: {
              targetBrand,
              websiteUrl,
              category,
              keywords: keywords || null,
              competitors,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }

      const shouldEmail =
        profile &&
        ['builder', 'growth'].includes(profile.plan) &&
        profile.email_notifications !== false
          && profile.email;

      if (shouldEmail && scanId) {
        const base = process.env.PUBLIC_DASHBOARD_URL || 'https://dashboard.visoraapp.com';
        await sendScanResultEmail({
          to: profile.email,
          brand: targetBrand,
          score: scoreData.score,
          prevScore,
          reportUrl: `${base}/dashboard/report/${scanId}`,
          isAuto: false,
        });
      }
    }

    res.json({ scanId, success: true });
  } catch (err) {
    console.error('Scan error:', err);
    if (scanId && process.env.SUPABASE_URL) {
      await supabase
        .from('scans')
        .update({
          status: 'error',
          error_message: err.message,
        })
        .eq('id', scanId);
    }
    res.status(500).json({ error: 'Scan failed', message: err.message });
  }
});
