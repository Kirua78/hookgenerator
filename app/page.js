import Link from 'next/link';

export default function Landing() {
  const hooks = {
    cyber: [
      "J'ai laissé mon mot de passe 'password123' pendant 3 ans. Voilà ce qu'on a volé.",
      "Un hacker m'a regardé taper mon code PIN à 50 mètres. Voici comment.",
      "Ton téléphone t'écoute en ce moment. La preuve en 30 secondes.",
    ],
    sport: [
      "J'ai perdu 12kg en 90 jours sans salle de sport. Voici l'unique chose que j'ai changée.",
      "Les athlètes pros font ça chaque matin. Toi tu dors encore.",
      "Stop aux squats. Cette erreur détruit tes genoux sans que tu t'en rendes compte.",
    ],
    lifestyle: [
      "J'ai arrêté de consulter mes mails le matin. Ma productivité a triplé en 2 semaines.",
      "J'ai vécu avec 500€/mois pendant 6 mois. Ce que j'ai appris va te surprendre.",
      "Personne ne te dit ça sur le succès : la flemme est ton meilleur allié.",
    ],
  };

  const testimonials = [
    {
      name: "Mathieu R.",
      handle: "@mathieu_fitness",
      avatar: "MR",
      niche: "Fitness · 84K abonnés",
      quote: "Avant HookGenerator, je passais 2h à écrire mes accroches. Maintenant 5 minutes. Mon taux de complétion a augmenté de 340% en un mois.",
      stat: "+340% de complétion",
      color: "from-pink-500 to-rose-500",
    },
    {
      name: "Sarah L.",
      handle: "@sarahinvest",
      avatar: "SL",
      niche: "Finance · 127K abonnés",
      quote: "Mon premier hook généré a fait 2,1M de vues sur TikTok. Je n'aurais jamais écrit ça toute seule. L'outil comprend vraiment ce qui fait scroller.",
      stat: "2,1M de vues",
      color: "from-violet-500 to-purple-500",
    },
    {
      name: "Kevin T.",
      handle: "@kevintech_fr",
      avatar: "KT",
      niche: "Tech · 52K abonnés",
      quote: "Le ton Storytelling a complètement changé ma façon de créer. Mes vidéos durent plus longtemps dans le feed et l'algo me pousse naturellement.",
      stat: "x4 portée organique",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Léa M.",
      handle: "@lea_lifestyle",
      avatar: "LM",
      niche: "Lifestyle · 213K abonnés",
      quote: "J'utilise le brief IA pour chaque idée de vidéo. C'est comme avoir un directeur créatif dans ma poche. Mes sponsors ont remarqué la différence.",
      stat: "+89% d'engagement",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const features = [
    { icon: "⚡", title: "Hooks viraux en 5 secondes", desc: "10 hooks percutants générés instantanément. Style Tinder pour garder les meilleurs." },
    { icon: "🎯", title: "Brief IA complet", desc: "Hook, angle, structure, CTA et astuce viralité pour chaque idée de vidéo." },
    { icon: "📝", title: "Légendes & Hashtags", desc: "Légendes optimisées et hashtags viraux adaptés à chaque plateforme." },
    { icon: "🔍", title: "Analyseur de hook", desc: "Score sur 10, points forts, faiblesses et version améliorée de ton hook." },
    { icon: "🏆", title: "Top Hooks de la semaine", desc: "Découvre les hooks les plus likés par la communauté pour t'inspirer." },
    { icon: "💾", title: "Sauvegarde illimitée", desc: "Retrouve tous tes hooks likés, idées et légendes dans ton espace personnel." },
  ];

  const platforms = ["TikTok", "Instagram", "YouTube", "LinkedIn", "Twitter/X", "Snapchat"];

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Nav */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <img src="/logo.png" alt="HookGenerator" className="h-10 object-contain" />
        <div className="flex items-center gap-4">
          <a href="/pricing" className="text-sm text-gray-400 hover:text-white transition">Tarifs</a>
          <a href="/auth" className="text-sm text-gray-400 hover:text-white transition">Connexion</a>
          <a href="/app" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:opacity-90 transition">
            Essayer gratuitement
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold px-4 py-2 rounded-full mb-6">
          ⚡ Plus de 50 000 hooks générés ce mois
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Tes vidéos méritent un
          <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"> hook qui déchire</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          L'IA qui génère des accroches virales pour TikTok, Instagram, YouTube et plus encore. Stop à la page blanche. Start au scroll.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="/app" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition shadow-2xl shadow-pink-500/25">
            ⚡ Essayer gratuitement
          </a>
          <a href="/pricing" className="border-2 border-gray-700 text-gray-300 hover:border-pink-500 hover:text-white font-bold text-lg px-8 py-4 rounded-2xl transition">
            Voir les tarifs →
          </a>
        </div>
        <p className="text-xs text-gray-600 mt-4">3 générations gratuites · Sans carte bancaire</p>
      </section>

      {/* Plateformes */}
      <section className="px-6 py-6 max-w-4xl mx-auto">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest font-bold mb-6">Compatible avec toutes les plateformes</p>
        <div className="flex flex-wrap justify-center gap-3">
          {platforms.map(p => (
            <span key={p} className="border border-gray-800 text-gray-400 text-sm px-4 py-2 rounded-full">{p}</span>
          ))}
        </div>
      </section>

      {/* Exemples de hooks */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Des hooks qui font <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">arrêter de scroller</span></h2>
          <p className="text-gray-400">Générés en quelques secondes. Adaptés à ta niche.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "🛡️ Cybersécurité", color: "border-blue-500/30 bg-blue-500/5", accent: "text-blue-400", hooks: hooks.cyber },
            { label: "💪 Sport & Fitness", color: "border-pink-500/30 bg-pink-500/5", accent: "text-pink-400", hooks: hooks.sport },
            { label: "✨ Lifestyle", color: "border-violet-500/30 bg-violet-500/5", accent: "text-violet-400", hooks: hooks.lifestyle },
          ].map((cat) => (
            <div key={cat.label} className={`border-2 ${cat.color} rounded-3xl p-6 space-y-4`}>
              <p className={`text-xs font-black tracking-widest uppercase ${cat.accent}`}>{cat.label}</p>
              {cat.hooks.map((hook, i) => (
                <div key={i} className="border border-gray-800 rounded-2xl p-4 bg-black/50">
                  <p className="text-white text-sm leading-relaxed">"{hook}"</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="px-6 py-20 bg-gray-950/50 max-w-full">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Tout ce dont tu as besoin pour <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">exploser sur les réseaux</span></h2>
            <p className="text-gray-400">4 outils puissants. 1 seule plateforme.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="border-2 border-gray-800 hover:border-pink-500/50 rounded-3xl p-6 transition group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-black text-lg mb-2 group-hover:text-pink-400 transition">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ils ont <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">explosé leurs stats</span></h2>
          <p className="text-gray-400">Des créateurs qui font confiance à HookGenerator chaque jour.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="border-2 border-gray-800 rounded-3xl p-6 hover:border-gray-600 transition">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${t.color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.handle} · {t.niche}</p>
                </div>
                <div className={`ml-auto bg-gradient-to-r ${t.color} text-white text-xs font-black px-3 py-1 rounded-full shrink-0`}>
                  {t.stat}
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed italic">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16 bg-gradient-to-r from-pink-500/10 to-violet-500/10 border-y border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: "50K+", label: "Hooks générés" },
            { stat: "4", label: "Langues supportées" },
            { stat: "8", label: "Plateformes" },
            { stat: "4.9/5", label: "Note moyenne" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-black bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">{s.stat}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Prêt à créer des hooks qui <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">font la différence ?</span></h2>
        <p className="text-gray-400 mb-8">Commence gratuitement. Upgrade quand tu veux.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/app" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition shadow-2xl shadow-pink-500/25">
            ⚡ Essayer gratuitement
          </a>
          <a href="/pricing" className="border-2 border-gray-700 text-gray-300 hover:border-pink-500 hover:text-white font-bold text-lg px-8 py-4 rounded-2xl transition">
            Voir les tarifs →
          </a>
        </div>
        <p className="text-xs text-gray-600 mt-4">3 générations gratuites · Sans carte bancaire · Annulation à tout moment</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <img src="/logo.png" alt="HookGenerator" className="h-8 object-contain" />
          <div className="flex gap-6 text-xs text-gray-600">
            <a href="/cgu" className="hover:text-gray-400 transition">CGU</a>
            <a href="/privacy" className="hover:text-gray-400 transition">Confidentialité</a>
            <a href="/mentions" className="hover:text-gray-400 transition">Mentions légales</a>
            <a href="mailto:contact@hookgenerator.eu" className="hover:text-gray-400 transition">Contact</a>
          </div>
          <p className="text-xs text-gray-700">© 2025 SB SOLUTION INFO</p>
        </div>
      </footer>
    </main>
  );
}