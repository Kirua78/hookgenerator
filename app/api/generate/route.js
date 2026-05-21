export async function POST(req) {
  const { description, platform, tone, langue } = await req.json();

  const toneInstructions = {
    // Français
    "Divertissant": "hooks amusants, légers, avec humour et énergie positive",
    "Inspirant": "hooks motivants, qui donnent envie de se dépasser, citations puissantes",
    "Éducatif": "hooks qui promettent d'apprendre quelque chose d'utile et concret",
    "Choquant": "hooks provocateurs, contre-intuitifs, qui brisent les croyances",
    "Émotionnel": "hooks qui touchent le cœur, créent de l'empathie ou de la nostalgie",
    "Storytelling": "hooks qui commencent une histoire, créent du suspense, donnent envie de connaître la suite (ex: 'Il y a 3 ans j'étais...', 'Ce jour-là tout a changé...')",
    // English
    "Entertaining": "fun, light-hearted hooks with humor and positive energy",
    "Inspiring": "motivating hooks that push people to surpass themselves",
    "Educational": "hooks that promise to teach something useful and concrete",
    "Shocking": "provocative, counter-intuitive hooks that break beliefs",
    "Emotional": "hooks that touch the heart, create empathy or nostalgia",
    // Español
    "Entretenido": "hooks divertidos, ligeros, con humor y energía positiva",
    "Inspirador": "hooks motivadores que dan ganas de superarse",
    "Educativo": "hooks que prometen enseñar algo útil y concreto",
    "Impactante": "hooks provocadores, contraintuitivos, que rompen creencias",
    "Emocional": "hooks que tocan el corazón, crean empatía o nostalgia",
    // Português
    "Divertido": "hooks divertidos, leves, com humor e energia positiva",
    "Inspirador": "hooks motivadores que dão vontade de se superar",
    "Educativo": "hooks que prometem ensinar algo útil e concreto",
    "Chocante": "hooks provocadores, contraintuitivos, que quebram crenças",
    "Emocional": "hooks que tocam o coração, criam empatia ou nostalgia",
  };

  // Storytelling is universal across all languages
  const toneDesc = toneInstructions[tone] || 
    "hooks qui commencent une histoire, créent du suspense et donnent envie de connaître la suite";

  const prompt = `Tu es un expert en création de contenu viral sur ${platform}.
Vidéo sur : ${description}
Langue de réponse : ${langue}
Ton : ${tone} — génère des ${toneDesc}.

Génère 10 hooks viraux COURTS et PERCUTANTS (1-2 phrases max chacun) pour accrocher l'audience dès les 3 premières secondes.

Règles :
- Chaque hook doit être différent dans sa structure
- Pas de guillemets autour des hooks
- Pas d'explication, juste les hooks numérotés
- Adapté à la culture et langue ${langue}
- Optimisé pour ${platform}
${tone === "Storytelling" ? "- Commence chaque hook par une amorce narrative : une situation passée, un tournant de vie, une révélation personnelle" : ""}

Format :
1. Hook ici
2. Hook ici
...
10. Hook ici`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  if (!data.choices) return Response.json({ result: 'Erreur: ' + JSON.stringify(data) });
  return Response.json({ result: data.choices[0].message.content });
}