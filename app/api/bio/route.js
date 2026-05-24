import { NextResponse } from 'next/server';

const langMap = { Français: 'français', English: 'English', Español: 'español', Português: 'português' };

export async function POST(req) {
  try {
    const { niche, platform, langue } = await req.json();
    if (!niche || !platform) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });

    const lang = langMap[langue] || 'français';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en personal branding et création de contenu ${platform}. Tu génères des bios optimisées en ${lang}.
Réponds UNIQUEMENT avec un JSON valide sans markdown.
Format: {"bios":[{"bio":"...","cta":"...","style":"..."},{"bio":"...","cta":"...","style":"..."},{"bio":"...","cta":"...","style":"..."}]}
3 bios différentes, chacune avec un style différent (ex: Inspirant, Authentique, Professionnel).
Chaque bio max 150 caractères. CTA court et percutant.`
          },
          { role: 'user', content: `Génère 3 bios ${platform} optimisées pour la niche "${niche}" en ${lang}.` }
        ],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
