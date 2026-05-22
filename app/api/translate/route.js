import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LANG_NAMES = {
  Français: 'français',
  English: 'English',
  Español: 'español',
  Português: 'português',
};

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

      if (!profile?.is_premium) {
        return NextResponse.json({ error: 'Fonctionnalité Premium' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { hook, targetLang } = await req.json();
    if (!hook || !targetLang) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });

    const langName = LANG_NAMES[targetLang] || targetLang;

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
            content: `Tu es un expert en création de contenu viral. Tu traduis des hooks viraux pour réseaux sociaux en ${langName}. 
Tu dois :
- Garder l'impact émotionnel et la puissance du hook original
- Adapter les expressions culturellement (pas juste traduire mot à mot)
- Conserver le même ton et style
- Répondre UNIQUEMENT avec le hook traduit, sans explication ni guillemets`
          },
          {
            role: 'user',
            content: `Traduis ce hook en ${langName} :\n\n${hook}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim();

    if (!translated) return NextResponse.json({ error: 'Erreur de traduction' }, { status: 500 });

    return NextResponse.json({ translated });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}