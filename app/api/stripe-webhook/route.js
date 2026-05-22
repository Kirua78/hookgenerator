import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return Response.json({ error: 'Webhook invalide' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;
    if (!userId || !plan) return Response.json({ received: true });

    let updates = { is_premium: true, plan };

    if (plan === 'mensuel') {
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      updates.subscription_end = end.toISOString().split('T')[0];
      updates.hooks_remaining = 0;
    } else if (plan === 'annuel') {
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);
      updates.subscription_end = end.toISOString().split('T')[0];
      updates.hooks_remaining = 0;
    } else if (plan === 'pack200') {
      updates.hooks_remaining = 200;
      updates.subscription_end = null;
    } else if (plan === 'pack500') {
      updates.hooks_remaining = 500;
      updates.subscription_end = null;
    }

    await supabaseAdmin
      .from('user_profiles')
      .upsert({ id: userId, ...updates });
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    // Chercher l'utilisateur via customer ID
    const { data } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('stripe_customer_id', sub.customer)
      .single();
    
    if (data) {
      await supabaseAdmin
        .from('user_profiles')
        .update({ is_premium: false, plan: 'free', subscription_end: null })
        .eq('id', data.id);
    }
  }

  return Response.json({ received: true });
}