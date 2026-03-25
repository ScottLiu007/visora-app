// visora/mvp/api/webhooks.js
// POST /api/webhooks/creem — handle Creem payment events

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

export const webhooksRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// Product ID → plan name mapping
const PRODUCT_PLAN_MAP = {
  'prod_1dI5h87ZhzzodGpRrRSvbW': 'builder',  // $29/mo
  'prod_1Xl8T46dBXT2zWowehqoQf': 'growth',   // $79/mo
};

// POST /api/webhooks/creem
webhooksRouter.post('/creem', async (req, res) => {
  try {
    const event = req.body;
    console.log('Creem webhook:', event?.type, JSON.stringify(event).slice(0, 200));

    // Handle subscription created or payment succeeded
    if (event?.type === 'subscription.active' || event?.type === 'checkout.completed') {
      const productId = event?.data?.product_id || event?.data?.subscription?.product_id;
      const customerEmail = event?.data?.customer?.email || event?.data?.email;
      const plan = PRODUCT_PLAN_MAP[productId];

      if (!plan || !customerEmail) {
        console.log('Unknown product or missing email:', productId, customerEmail);
        return res.json({ received: true });
      }

      // Find user by email
      const { data: authData } = await supabase.auth.admin.listUsers();
      const user = authData?.users?.find(u => u.email === customerEmail);

      if (!user) {
        console.log('User not found for email:', customerEmail);
        return res.json({ received: true });
      }

      // Upgrade plan
      const { error } = await supabase.from('profiles')
        .update({ plan, scan_credits: 9999, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) console.error('Profile update error:', error);
      else console.log(`✅ Upgraded ${customerEmail} to ${plan}`);
    }

    // Handle subscription cancelled
    if (event?.type === 'subscription.canceled') {
      const customerEmail = event?.data?.customer?.email;
      if (!customerEmail) return res.json({ received: true });

      const { data: authData } = await supabase.auth.admin.listUsers();
      const user = authData?.users?.find(u => u.email === customerEmail);

      if (user) {
        await supabase.from('profiles')
          .update({ plan: 'starter', scan_credits: 0, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        console.log(`⬇ Downgraded ${customerEmail} to starter`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
