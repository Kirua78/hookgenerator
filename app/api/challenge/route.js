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
            content: `Tu es un expert en marketing viral et création de challenges ${platform}. Tu génères des concepts de challenges viraux en ${lang}.
Réponds UNIQUEMENT avec un JSON valide sans markdown.
Format exact:
{"name":"...","hashtag":"...","hook":"...","rules":["règle1","règle2","règle3"],"invitation":"...","why":"..."}`
          },
          { role: 'user', content: `Génère un concept de challenge viral ${platform} pour la niche "${niche}" en ${lang}.` }
        ],
        max_tokens: 600,
        temperature: 0.9,
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
