import { createClient } from '@supabase/supabase-js';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX_ANONYMOUS = 3;

const botLimitMap = new Map();
const BOT_WINDOW = 60 * 1000;
const BOT_MAX = 5;

function checkAnonymousLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW) { rateLimitMap.set(ip, { count: 1, start: now }); return true; }
  if (entry.count >= RATE_LIMIT_MAX_ANONYMOUS) return false;
  rateLimitMap.set(ip, { count: entry.count + 1, start: entry.start });
  return true;
}

function checkBotLimit(ip) {
  const now = Date.now();
  const entry = botLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > BOT_WINDOW) { botLimitMap.set(ip, { count: 1, start: now }); return true; }
  if (entry.count >= BOT_MAX) return false;
  botLimitMap.set(ip, { count: entry.count + 1, start: entry.start });
  return true;
}

const CONNECTED_DAILY_LIMIT = 3;

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!checkBotLimit(ip)) {
    return Response.json({ error: 'Trop de requêtes. Réessaie dans une minute.' }, { status: 429 });
  }

  const body = await req.json();
  const { description, platform, tone, langue } = body;
  if (!description || !platform || !tone || !langue) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 });
  }
  if (description.length > 500) {
    return Response.json({ error: 'Description trop longue.' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    if (!checkAnonymousLimit(ip)) {
      return Response.json({ error: 'Limite gratuite atteinte. Crée un compte pour continuer.', limitReached: true }, { status: 429 });
    }
  }

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Token invalide.' }, { status: 401 });

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_premium, plan, hooks_remaining')
      .eq('id', user.id)
      .single();

    const isPremium = profile?.is_premium === true;
    const plan = profile?.plan || 'free';
    const hooksRemaining = profile?.hooks_remaining || 0;

    if (!isPremium) {
      // Plan gratuit → limite journalière
      const { data: genData } = await supabase
        .from('daily_generations')
        .select('count')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      const currentCount = genData?.count || 0;
      if (currentCount >= CONNECTED_DAILY_LIMIT) {
        return Response.json({ error: 'Limite journalière atteinte.', limitReached: true }, { status: 429 });
      }
      await supabase.rpc('increment_generation', { p_user_id: user.id });

    } else if (plan === 'pack200' || plan === 'pack500') {
      // Pack one-shot → vérifier et décrémenter hooks_remaining
      if (hooksRemaining <= 0) {
        // Pack épuisé → repasser en free
        await supabase.from('user_profiles').update({
          is_premium: false,
          plan: 'free',
          hooks_remaining: 0,
        }).eq('id', user.id);
        return Response.json({ error: 'Ton pack est épuisé. Recharge un pack pour continuer.', limitReached: true, packEmpty: true }, { status: 429 });
      }
      // Décrémenter de 10 (1 génération = 10 hooks individuels)
      const newRemaining = Math.max(0, hooksRemaining - 10);
      await supabase.from('user_profiles').update({
        hooks_remaining: newRemaining,
        // Si épuisé, repasser en free
        ...(newRemaining === 0 ? { is_premium: false, plan: 'free' } : {}),
      }).eq('id', user.id);

    }
    // Plan mensuel/annuel → illimité, rien à faire
  }

  const toneInstructions = {
    "Divertissant": "hooks amusants, légers, avec humour et énergie positive",
    "Inspirant": "hooks motivants, qui donnent envie de se dépasser, citations puissantes",
    "Éducatif": "hooks qui promettent d'apprendre quelque chose d'utile et concret",
    "Choquant": "hooks provocateurs, contre-intuitifs, qui brisent les croyances",
    "Émotionnel": "hooks qui touchent le cœur, créent de l'empathie ou de la nostalgie",
    "Storytelling": "hooks qui commencent une histoire, créent du suspense, donnent envie de connaître la suite",
    "Entertaining": "fun, light-hearted hooks with humor and positive energy",
    "Inspiring": "motivating hooks that push people to surpass themselves",
    "Educational": "hooks that promise to teach something useful and concrete",
    "Shocking": "provocative, counter-intuitive hooks that break beliefs",
    "Emotional": "hooks that touch the heart, create empathy or nostalgia",
    "Entretenido": "hooks divertidos, ligeros, con humor y energía positiva",
    "Inspirador": "hooks motivadores que dan ganas de superarse",
    "Educativo": "hooks que prometen enseñar algo útil y concreto",
    "Impactante": "hooks provocadores, contraintuitivos, que rompen creencias",
    "Emocional": "hooks que tocan el corazón, crean empatía o nostalgia",
    "Divertido": "hooks divertidos, leves, com humor e energia positiva",
    "Chocante": "hooks provocadores, contraintuitivos, que quebram crenças",
  };

  const toneDesc = toneInstructions[tone] || "hooks percutants et viraux";

  const prompt = `Tu es un expert en création de contenu viral sur ${platform}.
Vidéo sur : ${description}
Langue de réponse : ${langue}
Ton : ${tone} — génère des ${toneDesc}.

Génère 10 hooks viraux COURTS et PERCUTANTS (1-2 phrases max chacun) pour accrocher l'audience dès les 3 premières secondes.

Règles :
- Chaque hook doit être différent dans sa structure
- Pas de guillemets autour des hooks
- Pas d'explication, juste les hooks numérotés
- Adapté à la culture et langue ${langue}
- Optimisé pour ${platform}
${tone === "Storytelling" ? "- Commence chaque hook par une amorce narrative : une situation passée, un tournant de vie, une révélation personnelle" : ""}

Format :
1. Hook ici
2. Hook ici
...
10. Hook ici`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  if (!data.choices) return Response.json({ result: 'Erreur: ' + JSON.stringify(data) });
  return Response.json({ result: data.choices[0].message.content });
}