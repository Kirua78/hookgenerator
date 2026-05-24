import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (!profile?.is_premium) {
      return NextResponse.json({ error: 'Fonctionnalité Premium' }, { status: 403 });
    }

    const { niche, platform, langue } = await req.json();
    if (!niche || !platform) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });

    const langMap = { Français: 'français', English: 'English', Español: 'español', Português: 'português' };
    const lang = langMap[langue] || 'français';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en création de contenu viral pour ${platform}. Tu génères des plans de contenu en ${lang}.
Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backticks, sans explication.
Format exact :
{"days":[{"day":1,"hook":"...","idea":"...","tone":"..."},{"day":2,...},...]}
30 jours exactement. Hooks percutants et accrocheurs. Idées variées et originales. Tons variés parmi: Divertissant, Inspirant, Éducatif, Choquant, Émotionnel, Storytelling.`
          },
          {
            role: 'user',
            content: `Génère un plan de contenu de 30 jours pour la niche "${niche}" sur ${platform} en ${lang}.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 });

    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
