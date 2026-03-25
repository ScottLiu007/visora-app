// visora/mvp/src/email.js — transactional email via Resend (optional)

import { Resend } from 'resend';

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM || 'Visora <onboarding@resend.dev>';

/**
 * Notify user about a finished scan. Skips if RESEND_API_KEY missing or no recipient.
 * @param {{ to: string; brand: string; score: number; prevScore: number | null; reportUrl: string; isAuto?: boolean }} opts
 */
export async function sendScanResultEmail({ to, brand, score, prevScore, reportUrl, isAuto = false }) {
  if (!resendClient || !to) return { sent: false, reason: 'no_client_or_email' };

  const delta = prevScore == null ? null : score - prevScore;
  let subject = `${isAuto ? '[Weekly] ' : ''}Visora — ${brand} scored ${score}/100`;
  if (delta != null && delta !== 0) {
    subject += ` (${delta > 0 ? '+' : ''}${delta} vs last)`;
  } else if (delta === 0) {
    subject += ` (unchanged vs last)`;
  }

  const lines = [
    `Your GEO scan for ${brand} is ready.`,
    '',
    `Score: ${score}/100`,
    prevScore == null
      ? 'This is your first saved scan for this brand — use it as a baseline.'
      : `Previous score: ${prevScore}/100 (${delta > 0 ? '+' : ''}${delta ?? 0} points)`,
    '',
    `Open report: ${reportUrl}`,
    '',
    '— Visora',
    'https://visoraapp.com',
  ];

  const html = `
    <p style="font-family:system-ui,sans-serif;font-size:15px;color:#0f172a;line-height:1.6">
      <strong>${isAuto ? 'Weekly auto-scan complete' : 'Scan complete'}</strong> for <strong>${escapeHtml(brand)}</strong>.
    </p>
    <p style="font-family:ui-monospace,monospace;font-size:28px;font-weight:700;color:#0891b2;margin:16px 0">${score}<span style="font-size:14px;color:#64748b">/100</span></p>
    ${
      prevScore != null
        ? `<p style="font-family:system-ui,sans-serif;font-size:14px;color:#475569">Previous: ${prevScore}/100 · Change: <strong>${delta > 0 ? '+' : ''}${delta}</strong></p>`
        : `<p style="font-family:system-ui,sans-serif;font-size:14px;color:#475569">Baseline established — compare future scans here.</p>`
    }
    <p style="margin-top:24px"><a href="${reportUrl}" style="display:inline-block;background:#0891b2;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-family:system-ui,sans-serif">View report</a></p>
  `;

  try {
    await resendClient.emails.send({
      from: FROM,
      to: [to],
      subject,
      text: lines.join('\n'),
      html,
    });
    return { sent: true };
  } catch (e) {
    console.error('Resend error:', e.message);
    return { sent: false, reason: e.message };
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
