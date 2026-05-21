export async function POST(req) {
  const { hook, platform, langue } = await req.json();
  const prompt = 'Tu es un expert en creation de contenu viral sur ' + platform + '. Analyse ce hook : ' + hook + '. Langue de reponse : ' + langue + '. Donne : 1) Une note sur 10 2) Les points forts 3) Les points faibles 4) Une version amelioree. IMPORTANT: Sans asterisques ni markdown. Format: NOTE: X/10 POINTS FORTS: ... POINTS FAIBLES: ... VERSION AMELIOREE: ...';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
  });
  const data = await res.json();
  if (!data.choices) return Response.json({ result: 'Erreur: ' + JSON.stringify(data) });
  return Response.json({ result: data.choices[0].message.content });
}