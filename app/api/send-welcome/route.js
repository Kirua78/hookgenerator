export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { email, prenom } = await req.json();
  if (!email) return Response.json({ error: 'Email manquant' }, { status: 400 });

  const { error } = await resend.emails.send({
    from: 'HookGenerator <contact@hookgenerator.eu>',
    to: email,
    subject: '⚡ Bienvenue sur HookGenerator !',
    html: `
      <div style="background:#000;color:#fff;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
        <img src="https://hookgenerator.eu/logo.png" alt="HookGenerator" style="height:60px;margin-bottom:24px;" />
        <h1 style="font-size:28px;font-weight:900;margin-bottom:8px;">
          Bienvenue${prenom ? ' ' + prenom : ''} ! 🎉
        </h1>
        <p style="color:#9ca3af;font-size:16px;margin-bottom:32px;">
          Tu fais maintenant partie de la communauté HookGenerator. Prêt à créer des hooks qui font arrêter de scroller ?
        </p>
        <div style="background:#111;border:1px solid #222;border-radius:16px;padding:24px;margin-bottom:24px;">
          <p style="color:#f472b6;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Ce que tu peux faire dès maintenant</p>
          <p style="margin-bottom:8px;">⚡ <strong>Générer 3 hooks gratuits</strong> par jour</p>
          <p style="margin-bottom:8px;">📝 <strong>Créer des légendes</strong> optimisées pour chaque plateforme</p>
          <p style="margin-bottom:8px;">💡 <strong>Trouver des idées</strong> de vidéos avec brief IA complet</p>
          <p style="margin-bottom:0;">🔍 <strong>Analyser tes hooks</strong> et les améliorer</p>
        </div>
        <a href="https://hookgenerator.eu/app" style="display:inline-block;background:linear-gradient(to right,#ec4899,#8b5cf6);color:#fff;font-weight:900;font-size:16px;padding:16px 32px;border-radius:12px;text-decoration:none;margin-bottom:32px;">
          ⚡ Commencer à générer →
        </a>
        <div style="background:#111;border:1px solid #222;border-radius:16px;padding:24px;margin-bottom:24px;">
          <p style="color:#f472b6;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Tu veux aller plus loin ?</p>
          <p style="color:#9ca3af;font-size:14px;margin-bottom:16px;">Passe au <strong style="color:#fff;">Pro Creator</strong> pour des générations illimitées, la sauvegarde de tes hooks et bien plus.</p>
          <a href="https://hookgenerator.eu/pricing" style="display:inline-block;border:2px solid #ec4899;color:#ec4899;font-weight:700;font-size:14px;padding:10px 24px;border-radius:10px;text-decoration:none;">
            Voir les offres Premium →
          </a>
        </div>
        <p style="color:#4b5563;font-size:12px;text-align:center;margin-top:32px;">
          © 2025 SB SOLUTION INFO · <a href="https://hookgenerator.eu/cgu" style="color:#6b7280;">CGU</a> · <a href="https://hookgenerator.eu/privacy" style="color:#6b7280;">Confidentialité</a>
          <br/>Tu reçois cet email car tu t'es inscrit sur HookGenerator.
        </p>
      </div>
    `,
  });

  if (error) return Response.json({ error }, { status: 500 });
  return Response.json({ success: true });
}