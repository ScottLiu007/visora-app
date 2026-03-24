// visora/mvp/api/waitlist.js
// POST /api/waitlist — collect early access emails

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

export const waitlistRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// POST /api/waitlist
waitlistRouter.post('/', async (req, res) => {
  const { email, source = 'api' } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  if (process.env.SUPABASE_URL) {
    const { error } = await supabase
      .from('waitlist')
      .upsert({ email, source, signed_up_at: new Date().toISOString() }, { onConflict: 'email' });

    if (error) console.error('Waitlist insert error:', error);
  }

  res.json({ success: true, message: "You're on the list." });
});

// GET /api/waitlist/count — how many on list (public-safe)
waitlistRouter.get('/count', async (req, res) => {
  if (!process.env.SUPABASE_URL) return res.json({ count: 0 });
  const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });
  res.json({ count: count || 0 });
});
