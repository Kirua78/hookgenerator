import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { newUserId, referralCode } = await req.json();
    if (!newUserId || !referralCode) return NextResponse.json({ ok: false });

    // Trouver le parrain
    const { data: referrer } = await supabase
      .from('user_profiles')
      .select('id, referral_count, is_premium, subscription_end')
      .eq('referral_code', referralCode)
      .single();

    if (!referrer) return NextResponse.json({ ok: false, error: 'Code invalide' });

    // Enregistrer le parrainage sur le nouvel utilisateur
    await supabase
      .from('user_profiles')
      .update({ referred_by: referralCode })
      .eq('id', newUserId);

    // Incrémenter le compteur du parrain
    const newCount = (referrer.referral_count || 0) + 1;

    // Calculer la nouvelle date de fin d'abonnement (+1 mois)
    const now = new Date();
    let subEnd = referrer.subscription_end ? new Date(referrer.subscription_end) : now;
    if (subEnd < now) subEnd = now;
    subEnd.setMonth(subEnd.getMonth() + 1);

    await supabase
      .from('user_profiles')
      .update({
        referral_count: newCount,
        is_premium: true,
        plan: referrer.is_premium ? referrer.plan : 'mensuel',
        subscription_end: subEnd.toISOString().split('T')[0],
      })
      .eq('id', referrer.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 });
  }
}