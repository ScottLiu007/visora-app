// visora/mvp/api/user.js
// GET /api/user/plan — returns user's plan and scan credits

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

export const userRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// GET /api/user/plan
userRouter.get('/plan', async (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'];
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const { data, error } = await supabase
    .from('profiles')
    .select('plan, scan_credits')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Auto-create profile if missing
    await supabase.from('profiles').upsert({ id: userId, email: '', plan: 'starter', scan_credits: 1 });
    return res.json({ plan: 'starter', scan_credits: 1 });
  }

  res.json({ plan: data.plan, scan_credits: data.scan_credits });
});
