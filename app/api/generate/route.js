export async function POST(req) {
  const { description, platform, tone, langue } = await req.json();
  const prompt = 'Tu es un expert en creation de contenu viral sur ' + platform + '. Video sur : ' + description + '. Ton : ' + tone + '. IMPORTANT: Reponds UNIQUEMENT en ' + langue + '. Genere 10 hooks courts et percutants SANS guillemets, SANS asterisques, SANS parentheses, SANS ponctuation finale. Format strict: 1. texte hook';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
  });
  const data = await res.json();
  if (!data.choices) return Response.json({ result: 'Erreur: ' + JSON.stringify(data) });
  return Response.json({ result: data.choices[0].message.content });
}