export async function POST(req) {
  const { description, platform, langue } = await req.json();
  const prompt = 'Tu es un expert en creation de contenu sur ' + platform + '. Genere une legende engageante et des hashtags optimises pour une video sur : ' + description + '. Reponds en ' + langue + '. IMPORTANT: Sans asterisques ni markdown. Format strict - LEGENDE: texte de la legende HASHTAGS: liste des hashtags';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 500, messages: [{ role: 'user', content: prompt }] })
  });
  const data = await res.json();
  if (!data.choices) return Response.json({ result: 'Erreur: ' + JSON.stringify(data) });
  return Response.json({ result: data.choices[0].message.content });
}