import { createClient } from '@supabase/supabase-js';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW) { rateLimitMap.set(ip, { count: 1, start: now }); return true; }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  rateLimitMap.set(ip, { count: entry.count + 1, start: entry.start });
  return true;
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) return Response.json({ error: 'Trop de requêtes. Réessaie dans une minute.' }, { status: 429 });

  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
    await supabase.auth.getUser();
  }

  const { idee, niche, platform, langue } = await req.json();
  if (!idee || !platform || !langue) return Response.json({ error: 'Paramètres manquants.' }, { status: 400 });
  if (idee.length > 300) return Response.json({ error: 'Idée trop longue.' }, { status: 400 });

  const prompt = "Tu es un expert en création de contenu viral sur " + platform + ".\nLangue de réponse : " + langue + "\nNiche : " + niche + "\nIdee de video : " + idee + "\n\nGenere un brief complet pour cette video. Format STRICT sans markdown ni asterisques :\n\nHOOK:\n1 hook d accroche percutant pour les 3 premieres secondes\n\nANGLE:\nL angle unique et differenciant pour traiter ce sujet\n\nSTRUCTURE:\n1. Etape 1\n2. Etape 2\n3. Etape 3\n4. Etape 4\n5. Etape 5\n\nCALL TO ACTION:\nUne phrase de fin engageante\n\nASTUCE:\n1 conseil pour maximiser la viralite de cette video sur " + platform;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
  });
  const data = await res.json();
  if (!data.choices) return Response.json({ result: 'Erreur: ' + JSON.stringify(data) });
  return Response.json({ result: data.choices[0].message.content });
}