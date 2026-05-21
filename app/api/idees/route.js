import { createClient } from '@supabase/supabase-js';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

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

  const { niche, platform, langue } = await req.json();
  if (!niche || !platform || !langue) return Response.json({ error: 'Paramètres manquants.' }, { status: 400 });
  if (niche.length > 200) return Response.json({ error: 'Niche trop longue.' }, { status: 400 });

  const prompt = 'Tu es un expert en creation de contenu sur ' + platform + '. Genere 10 idees de videos originales et virales pour un createur dans la niche : ' + niche + '. Langue de reponse : ' + langue + '. IMPORTANT: Sans asterisques ni markdown. Format strict: 1. titre de lidee';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
  });
  const data = await res.json();
  if (!data.choices) return Response.json({ result: 'Erreur: ' + JSON.stringify(data) });
  return Response.json({ result: data.choices[0].message.content });
}