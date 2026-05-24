import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

const emailJ2 = (email, prenom) => ({
  from: 'HookGenerator <noreply@hookgenerator.eu>',
  to: email,
  subject: '3 secrets pour des hooks qui cartonnent 🎣',
  html: `
<!DOCTYPE html>
<html>
<body style="background:#0a0a0f;color:#ededed;font-family:Arial,sans-serif;padding:40px 20px;max-width:600px;margin:0 auto;">
  <img src="https://hookgenerator.eu/logo.png" alt="HookGenerator" style="height:50px;margin-bottom:30px;" />
  <h1 style="color:#fff;font-size:24px;margin-bottom:8px;">Les 3 secrets des hooks viraux 🎣</h1>
  <p style="color:#9ca3af;margin-bottom:24px;">Salut ${prenom || ''} ! Voici ce que les créateurs qui cartonnent font différemment.</p>

  <div style="background:#111;border:1px solid #333;border-radius:16px;padding:20px;margin-bottom:16px;">
    <p style="color:#f472b6;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">SECRET 1</p>
    <p style="color:#fff;font-weight:bold;margin:0 0 8px;">Les 3 premières secondes décident tout</p>
    <p style="color:#9ca3af;font-size:14px;margin:0;">L'algorithme mesure le taux de rétention dès la première seconde. Si tu perds le viewer, tu perds le boost.</p>
  </div>

  <div style="background:#111;border:1px solid #333;border-radius:16px;padding:20px;margin-bottom:16px;">
    <p style="color:#f472b6;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">SECRET 2</p>
    <p style="color:#fff;font-weight:bold;margin:0 0 8px;">La curiosité > l'information</p>
    <p style="color:#9ca3af;font-size:14px;margin:0;">Un hook qui promet une révélation ("Ce que personne ne te dit sur...") performe 3x mieux qu'un hook qui informe directement.</p>
  </div>

  <div style="background:#111;border:1px solid #333;border-radius:16px;padding:20px;margin-bottom:24px;">
    <p style="color:#f472b6;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">SECRET 3</p>
    <p style="color:#fff;font-weight:bold;margin:0 0 8px;">Teste 10 hooks, garde le meilleur</p>
    <p style="color:#9ca3af;font-size:14px;margin:0;">Les créateurs à 1M d'abonnés testent en moyenne 8-12 accroches avant de poster. HookGenerator fait ça en 5 secondes.</p>
  </div>

  <a href="https://hookgenerator.eu/app" style="display:block;background:linear-gradient(to right,#ec4899,#8b5cf6);color:#fff;text-decoration:none;font-weight:bold;padding:16px;border-radius:12px;text-align:center;margin-bottom:24px;">
    Générer mes hooks maintenant →
  </a>

  <p style="color:#4b5563;font-size:12px;text-align:center;">HookGenerator · <a href="https://hookgenerator.eu/privacy" style="color:#6b7280;">Se désabonner</a></p>
</body>
</html>
  `
});

const emailJ5 = (email, prenom) => ({
  from: 'HookGenerator <noreply@hookgenerator.eu>',
  to: email,
  subject: 'Tu laisses de l\'argent sur la table 💸',
  html: `
<!DOCTYPE html>
<html>
<body style="background:#0a0a0f;color:#ededed;font-family:Arial,sans-serif;padding:40px 20px;max-width:600px;margin:0 auto;">
  <img src="https://hookgenerator.eu/logo.png" alt="HookGenerator" style="height:50px;margin-bottom:30px;" />
  <h1 style="color:#fff;font-size:24px;margin-bottom:8px;">Passe au niveau supérieur 🚀</h1>
  <p style="color:#9ca3af;margin-bottom:24px;">Salut ${prenom || ''}, tu utilises HookGenerator depuis quelques jours. Voici ce que tu rates encore.</p>

  <div style="background:#1a0a1f;border:1px solid #7c3aed;border-radius:16px;padding:24px;margin-bottom:24px;">
    <p style="color:#a78bfa;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">PRO CREATOR — dès 3,33€/mois</p>
    ${['Générations illimitées chaque jour', 'Traduction automatique en 4 langues', 'Calendrier éditorial 7 jours', 'Plan de contenu 30 jours complet', 'Générateur de bio + challenge viral'].map(f => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <span style="color:#ec4899;font-weight:bold;">✓</span>
      <p style="color:#fff;font-size:14px;margin:0;">${f}</p>
    </div>`).join('')}
  </div>

  <a href="https://hookgenerator.eu/pricing" style="display:block;background:linear-gradient(to right,#ec4899,#8b5cf6);color:#fff;text-decoration:none;font-weight:bold;padding:16px;border-radius:12px;text-align:center;margin-bottom:16px;">
    ⭐ Passer Premium maintenant →
  </a>

  <p style="color:#6b7280;font-size:13px;text-align:center;margin-bottom:24px;">Annulable à tout moment · Satisfait ou remboursé 7 jours</p>

  <p style="color:#4b5563;font-size:12px;text-align:center;">HookGenerator · <a href="https://hookgenerator.eu/privacy" style="color:#6b7280;">Se désabonner</a></p>
</body>
</html>
  `
});

export async function GET(req) {
  // Vérifier le secret cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const now = new Date();

  // J+2 : inscrits il y a 2 jours
  const j2Start = new Date(now); j2Start.setDate(j2Start.getDate() - 2); j2Start.setHours(0,0,0,0);
  const j2End = new Date(j2Start); j2End.setHours(23,59,59,999);

  // J+5 : inscrits il y a 5 jours
  const j5Start = new Date(now); j5Start.setDate(j5Start.getDate() - 5); j5Start.setHours(0,0,0,0);
  const j5End = new Date(j5Start); j5End.setHours(23,59,59,999);

  // Récupérer les utilisateurs J+2
  const { data: usersJ2 } = await supabase
    .from('user_profiles')
    .select('id, email')
    .gte('created_at', j2Start.toISOString())
    .lte('created_at', j2End.toISOString())
    .not('email', 'is', null);

  // Récupérer les utilisateurs J+5 non premium
  const { data: usersJ5 } = await supabase
    .from('user_profiles')
    .select('id, email')
    .gte('created_at', j5Start.toISOString())
    .lte('created_at', j5End.toISOString())
    .eq('is_premium', false)
    .not('email', 'is', null);

  let sentJ2 = 0, sentJ5 = 0;

  for (const user of (usersJ2 || [])) {
    if (!user.email) continue;
    try {
      await resend.emails.send(emailJ2(user.email, ''));
      sentJ2++;
    } catch (e) { console.error('J2 error:', e); }
  }

  for (const user of (usersJ5 || [])) {
    if (!user.email) continue;
    try {
      await resend.emails.send(emailJ5(user.email, ''));
      sentJ5++;
    } catch (e) { console.error('J5 error:', e); }
  }

  return NextResponse.json({ ok: true, sentJ2, sentJ5 });
}