export async function POST(req) {
  const { idee, niche, platform, langue } = await req.json();

  const prompt = "Tu es un expert en creation de contenu viral sur " + platform + ".\nLangue de reponse : " + langue + "\nNiche : " + niche + "\nIdee de video : " + idee + "\n\nGenere un brief complet pour cette video. Format STRICT sans markdown ni asterisques :\n\nHOOK:\n1 hook d accroche percutant pour les 3 premieres secondes\n\nANGLE:\nL angle unique et differenciant pour traiter ce sujet\n\nSTRUCTURE:\n1. Etape 1\n2. Etape 2\n3. Etape 3\n4. Etape 4\n5. Etape 5\n\nCALL TO ACTION:\nUne phrase de fin engageante\n\nASTUCE:\n1 conseil pour maximiser la viralite de cette video sur " + platform;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  if (!data.choices) return Response.json({ result: 'Erreur: ' + JSON.stringify(data) });
  return Response.json({ result: data.choices[0].message.content });
}