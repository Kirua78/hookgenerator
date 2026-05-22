export const dynamic = 'force-dynamic';

const PRICE_IDS = {
  mensuel: process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSUEL,
  annuel: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUEL,
  pack200: process.env.NEXT_PUBLIC_STRIPE_PRICE_200,
  pack500: process.env.NEXT_PUBLIC_STRIPE_PRICE_500,
};

export async function POST(req) {
  const Stripe = (await import('stripe')).default;
  const { createClient } = await import('@supabase/supabase-js');

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const authHeader = req.headers.get('authorization');
  if (!authHeader) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const { priceKey } = await req.json();
  const priceId = PRICE_IDS[priceKey];
  if (!priceId) return Response.json({ error: 'Plan invalide' }, { status: 400 });

  const isSubscription = priceKey === 'mensuel' || priceKey === 'annuel';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: isSubscription ? 'subscription' : 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?plan=${priceKey}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: user.email,
    metadata: { user_id: user.id, plan: priceKey },
  });

  return Response.json({ url: session.url });
}