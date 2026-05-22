'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = "hg_generations";

function getLocalGenerations() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const today = new Date().toISOString().split("T")[0];
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch { return 0; }
}

function incrementLocalGenerations() {
  const today = new Date().toISOString().split("T")[0];
  const count = getLocalGenerations() + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }));
}

const TL = {
  Français: {
    flag: "🇫🇷",
    tagline: "Plus de 50 000 hooks générés ce mois",
    h1a: "Tes vidéos méritent un",
    h1b: "hook qui déchire",
    desc: "L'outil qui génère des accroches virales pour TikTok, Instagram, YouTube et plus encore. Stop à la page blanche. Start au scroll.",
    tryFree: "Essayer gratuitement",
    openApp: "Accéder à l'app →",
    seePricing: "Voir les tarifs →",
    disclaimer: "3 générations gratuites · Sans carte bancaire",
    tryNow: "Essaie maintenant",
    tryNowSub: "Tape ta niche et vois ce que l'outil génère en quelques secondes.",
    videoAbout: "Ta vidéo parle de quoi ?",
    generate: "Générer 3 hooks gratuits",
    generating: "Génération en cours...",
    remaining: "restante",
    remainingPlural: "restantes",
    usedAll: "Tu as utilisé tes 3 générations gratuites !",
    createAccount: "Crée un compte gratuit pour continuer.",
    createBtn: "Créer un compte gratuit →",
    hooksGenerated: "Tes hooks générés",
    createMore: "Créer un compte pour générer 10 hooks par jour →",
    platforms: "Compatible avec toutes les plateformes",
    hooksTitle: "Des hooks qui font",
    hooksTitleAccent: "arrêter de scroller",
    hooksSub: "Générés en quelques secondes. Adaptés à ta niche.",
    featuresTitle: "Tout ce dont tu as besoin pour",
    featuresTitleAccent: "exploser sur les réseaux",
    featuresSub: "4 outils puissants. 1 seule plateforme.",
    ctaTitle: "Prêt à créer des hooks qui",
    ctaTitleAccent: "font la différence ?",
    ctaSub: "Commence gratuitement. Upgrade quand tu veux.",
    ctaDisclaimer: "3 générations gratuites · Sans carte bancaire · Annulation à tout moment",
    tarifs: "Tarifs",
    connexion: "Connexion",
    cgu: "CGU",
    confidentialite: "Confidentialité",
    mentions: "Mentions légales",
    contact: "Contact",
  },
  English: {
    flag: "🇬🇧",
    tagline: "More than 50,000 hooks generated this month",
    h1a: "Your videos deserve a",
    h1b: "hook that kills it",
    desc: "The tool that generates viral hooks for TikTok, Instagram, YouTube and more. Stop the blank page. Start the scroll.",
    tryFree: "Try for free",
    openApp: "Open the app →",
    seePricing: "See pricing →",
    disclaimer: "3 free generations · No credit card",
    tryNow: "Try it now",
    tryNowSub: "Type your niche and see what the tool generates in seconds.",
    videoAbout: "What is your video about?",
    generate: "Generate 3 free hooks",
    generating: "Generating...",
    remaining: "remaining",
    remainingPlural: "remaining",
    usedAll: "You have used your 3 free generations!",
    createAccount: "Create a free account to continue.",
    createBtn: "Create a free account →",
    hooksGenerated: "Your generated hooks",
    createMore: "Create an account to generate 10 hooks per day →",
    platforms: "Compatible with all platforms",
    hooksTitle: "Hooks that make people",
    hooksTitleAccent: "stop scrolling",
    hooksSub: "Generated in seconds. Adapted to your niche.",
    featuresTitle: "Everything you need to",
    featuresTitleAccent: "blow up on social media",
    featuresSub: "4 powerful tools. 1 platform.",
    ctaTitle: "Ready to create hooks that",
    ctaTitleAccent: "make a difference?",
    ctaSub: "Start for free. Upgrade whenever you want.",
    ctaDisclaimer: "3 free generations · No credit card · Cancel anytime",
    tarifs: "Pricing",
    connexion: "Login",
    cgu: "Terms",
    confidentialite: "Privacy",
    mentions: "Legal",
    contact: "Contact",
  },
  Español: {
    flag: "🇪🇸",
    tagline: "Más de 50,000 hooks generados este mes",
    h1a: "Tus videos merecen un",
    h1b: "hook que destruye",
    desc: "La herramienta que genera ganchos virales para TikTok, Instagram, YouTube y más. Stop a la página en blanco. Start al scroll.",
    tryFree: "Probar gratis",
    openApp: "Abrir la app →",
    seePricing: "Ver precios →",
    disclaimer: "3 generaciones gratuitas · Sin tarjeta",
    tryNow: "Pruébalo ahora",
    tryNowSub: "Escribe tu nicho y ve lo que genera en segundos.",
    videoAbout: "¿De qué trata tu video?",
    generate: "Generar 3 hooks gratis",
    generating: "Generando...",
    remaining: "restante",
    remainingPlural: "restantes",
    usedAll: "¡Has usado tus 3 generaciones gratuitas!",
    createAccount: "Crea una cuenta gratis para continuar.",
    createBtn: "Crear cuenta gratis →",
    hooksGenerated: "Tus hooks generados",
    createMore: "Crear cuenta para generar 10 hooks por día →",
    platforms: "Compatible con todas las plataformas",
    hooksTitle: "Hooks que hacen",
    hooksTitleAccent: "parar el scroll",
    hooksSub: "Generados en segundos. Adaptados a tu nicho.",
    featuresTitle: "Todo lo que necesitas para",
    featuresTitleAccent: "explotar en redes sociales",
    featuresSub: "4 herramientas potentes. 1 plataforma.",
    ctaTitle: "¿Listo para crear hooks que",
    ctaTitleAccent: "marcan la diferencia?",
    ctaSub: "Empieza gratis. Actualiza cuando quieras.",
    ctaDisclaimer: "3 generaciones gratuitas · Sin tarjeta · Cancela cuando quieras",
    tarifs: "Precios",
    connexion: "Entrar",
    cgu: "Términos",
    confidentialite: "Privacidad",
    mentions: "Legal",
    contact: "Contacto",
  },
  Português: {
    flag: "🇧🇷",
    tagline: "Mais de 50.000 hooks gerados este mês",
    h1a: "Seus vídeos merecem um",
    h1b: "hook que arrasa",
    desc: "A ferramenta que gera ganchos virais para TikTok, Instagram, YouTube e mais. Pare com a página em branco. Comece o scroll.",
    tryFree: "Experimentar grátis",
    openApp: "Abrir o app →",
    seePricing: "Ver preços →",
    disclaimer: "3 gerações gratuitas · Sem cartão",
    tryNow: "Experimente agora",
    tryNowSub: "Digite seu nicho e veja o que a ferramenta gera em segundos.",
    videoAbout: "Sobre o que é o seu vídeo?",
    generate: "Gerar 3 hooks grátis",
    generating: "Gerando...",
    remaining: "restante",
    remainingPlural: "restantes",
    usedAll: "Você usou suas 3 gerações gratuitas!",
    createAccount: "Crie uma conta grátis para continuar.",
    createBtn: "Criar conta grátis →",
    hooksGenerated: "Seus hooks gerados",
    createMore: "Criar conta para gerar 10 hooks por dia →",
    platforms: "Compatível com todas as plataformas",
    hooksTitle: "Hooks que fazem",
    hooksTitleAccent: "parar de rolar",
    hooksSub: "Gerados em segundos. Adaptados ao seu nicho.",
    featuresTitle: "Tudo que você precisa para",
    featuresTitleAccent: "explodir nas redes sociais",
    featuresSub: "4 ferramentas poderosas. 1 plataforma.",
    ctaTitle: "Pronto para criar hooks que",
    ctaTitleAccent: "fazem a diferença?",
    ctaSub: "Comece grátis. Atualize quando quiser.",
    ctaDisclaimer: "3 gerações gratuitas · Sem cartão · Cancele quando quiser",
    tarifs: "Preços",
    connexion: "Entrar",
    cgu: "Termos",
    confidentialite: "Privacidade",
    mentions: "Legal",
    contact: "Contato",
  },
};

function LandingLangSelector({ langue, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const langs = Object.keys(TL);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="text-2xl hover:scale-110 transition-transform" title={langue}>
        {TL[langue].flag}
      </button>
      {open && (
        <div className="absolute top-10 left-0 bg-gray-950 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-xl z-20 min-w-max">
          {langs.map(l => (
            <button key={l} onClick={() => { onChange(l); setOpen(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left transition ${langue === l ? "bg-pink-500/10 text-pink-400" : "text-gray-300 hover:bg-gray-800"}`}>
              <span>{TL[l].flag}</span><span>{l}</span>
              {langue === l && <span className="ml-auto text-pink-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DemoSection({ t }) {
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  const platforms = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'LinkedIn'];

  const generate = async () => {
    if (!description) return;
    const remaining = 3 - getLocalGenerations();
    if (remaining <= 0) {
      setError(t.usedAll);
      return;
    }
    setLoading(true); setError(''); setHooks([]);
    incrementLocalGenerations();
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, platform, tone: 'Divertissant', langue: 'Français' }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }
    const parsed = data.result.split('\n')
      .map(l => { const m = l.match(/^\d+[\.\)]\s*(.+)$/); return m ? m[1].replace(/\*\*/g, '').trim() : null; })
      .filter(Boolean).slice(0, 3);
    setHooks(parsed);
    setLoading(false);
  };

  const copy = (text, i) => { navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 2000); };
  const remaining = typeof window !== 'undefined' ? 3 - getLocalGenerations() : 3;

  return (
    <section className="relative px-6 py-24 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black mb-4">
          {t.tryNow} <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">✨</span>
        </h2>
        <p className="text-gray-400">{t.tryNowSub}</p>
      </div>
      <div className="border-2 border-gray-800 rounded-3xl p-6 space-y-4 bg-black/60 backdrop-blur-sm">
        <div className="relative">
          <textarea
            className="w-full bg-transparent border-2 border-gray-800 rounded-2xl px-5 pt-7 pb-3 text-white placeholder-transparent focus:outline-none focus:border-pink-500 transition resize-none h-24 peer"
            placeholder="description" value={description}
            onChange={e => setDescription(e.target.value)} id="demo-desc" />
          <label htmlFor="demo-desc" className="absolute left-5 top-2 text-xs font-black tracking-widest uppercase text-pink-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-pink-400 transition-all pointer-events-none">
            {t.videoAbout}
          </label>
        </div>
        <div className="flex gap-2 flex-wrap">
          {platforms.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition ${platform === p ? 'border-pink-500 text-pink-400 bg-pink-500/10' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>
              {p}
            </button>
          ))}
        </div>
        {remaining > 0 ? (
          <button onClick={generate} disabled={loading || !description}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 transition">
            {loading ? t.generating : `${t.generate} (${remaining} ${remaining > 1 ? t.remainingPlural : t.remaining})`}
          </button>
        ) : (
          <div className="border-2 border-pink-500/30 bg-pink-500/5 rounded-2xl p-4 text-center">
            <p className="text-white font-bold mb-1">{t.usedAll}</p>
            <p className="text-gray-400 text-sm mb-3">{t.createAccount}</p>
            <a href="/auth" className="inline-block bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2 px-6 rounded-full text-sm">{t.createBtn}</a>
          </div>
        )}
        {error && (
          <div className="border-2 border-pink-500/30 bg-pink-500/5 rounded-2xl p-4 text-center">
            <p className="text-white font-bold mb-1">{error}</p>
            <a href="/auth" className="inline-block mt-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2 px-6 rounded-full text-sm">{t.createBtn}</a>
          </div>
        )}
        {hooks.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-xs font-black tracking-widest uppercase text-pink-400">{t.hooksGenerated}</p>
            {hooks.map((hook, i) => (
              <div key={i} onClick={() => copy(hook, i)}
                className="border-2 border-gray-800 hover:border-pink-500 rounded-2xl p-4 cursor-pointer transition flex justify-between items-center gap-3">
                <p className="text-white text-sm">{hook}</p>
                <span className="text-gray-500 shrink-0">{copied === i ? '✅' : '📋'}</span>
              </div>
            ))}
            <a href="/auth" className="block w-full text-center border-2 border-pink-500/50 hover:border-pink-500 text-pink-400 py-3 rounded-2xl transition text-sm font-medium">
              {t.createMore}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Landing() {
  const [user, setUser] = useState(null);
  const [langue, setLangue] = useState('Français');
  const t = TL[langue];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

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

  const features = [
    { title: "Hooks viraux en 5 secondes", desc: "10 hooks percutants générés instantanément. Style Tinder pour garder les meilleurs." },
    { title: "Brief outil complet", desc: "Hook, angle, structure, CTA et astuce viralité pour chaque idée de vidéo." },
    { title: "Légendes & Hashtags", desc: "Légendes optimisées et hashtags viraux adaptés à chaque plateforme." },
    { title: "Analyseur de hook", desc: "Score sur 10, points forts, faiblesses et version améliorée de ton hook." },
    { title: "Top Hooks de la semaine", desc: "Découvre les hooks les plus likés par la communauté pour t'inspirer." },
    { title: "Sauvegarde illimitée", desc: "Retrouve tous tes hooks likés, idées et légendes dans ton espace personnel." },
  ];

  const platforms = [
    { name: "TikTok", svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.53V6.78a4.85 4.85 0 01-1.02-.09z"/></svg> },
    { name: "Instagram", svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
    { name: "YouTube", svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
    { name: "LinkedIn", svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { name: "Twitter/X", svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { name: "Snapchat", svg: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.317 4.814-.04.752-.081 1.15.157 1.292.374.213 1.05-.023 1.738-.584.211-.172.455-.268.698-.268.374 0 .698.2.806.5.14.37-.005.818-.414 1.164-.271.23-1.878 1.348-1.878 2.387 0 .18.033.36.098.528 0 0 .55 1.553 2.39 2.643.27.16.387.5.28.79-.1.28-.37.46-.67.46-.05 0-.11-.01-.16-.02-.07-.01-.16-.02-.25-.03-.52-.07-1.38-.19-2.45.04-.43.09-.83.27-1.21.44-1.29.57-2.73 1.21-5.54 1.21-2.8 0-4.24-.64-5.54-1.21-.38-.17-.78-.35-1.21-.44-1.07-.23-1.93-.11-2.45-.04-.09.01-.18.02-.25.03-.05.01-.11.02-.16.02-.3 0-.57-.18-.67-.46-.11-.29.01-.63.28-.79 1.84-1.09 2.39-2.643 2.39-2.643.065-.168.098-.348.098-.528 0-1.04-1.607-2.157-1.878-2.387-.409-.346-.554-.793-.414-1.164.108-.3.432-.5.806-.5.243 0 .487.096.698.268.688.561 1.364.797 1.738.584.238-.142.197-.54.157-1.292-.086-1.595-.212-3.621.317-4.814C7.859 1.07 11.216.793 12.206.793z"/></svg> },
  ];

  return (
    <main className="min-h-screen text-white overflow-hidden">

      {/* Nav */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="HookGenerator" className="h-10 object-contain" />
          <LandingLangSelector langue={langue} onChange={setLangue} />
        </div>
        <div className="flex items-center gap-4">
          <a href="/pricing" className="text-sm text-gray-400 hover:text-white transition">{t.tarifs}</a>
          {user ? (
            <a href="/app" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:opacity-90 transition">
              {t.openApp}
            </a>
          ) : (
            <>
              <a href="/auth" className="text-sm text-gray-400 hover:text-white transition">{t.connexion}</a>
              <a href="/auth" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:opacity-90 transition">
                {t.tryFree}
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold px-4 py-2 rounded-full mb-6">
          {t.tagline}
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          {t.h1a}
          <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent"> {t.h1b}</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">{t.desc}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {user ? (
            <a href="/app" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition shadow-2xl shadow-pink-500/25">
              {t.openApp}
            </a>
          ) : (
            <a href="/auth" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition shadow-2xl shadow-pink-500/25">
              {t.tryFree}
            </a>
          )}
          <a href="/pricing" className="border-2 border-gray-700 text-gray-300 hover:border-pink-500 hover:text-white font-bold text-lg px-8 py-4 rounded-2xl transition">
            {t.seePricing}
          </a>
        </div>
        <p className="text-xs text-gray-600 mt-4">{t.disclaimer}</p>
      </section>

      {/* Démo interactive */}
      <DemoSection t={t} />

      {/* Plateformes */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest font-bold mb-8">{t.platforms}</p>
        <div className="flex flex-wrap justify-center gap-4">
          {platforms.map(p => (
            <div key={p.name} className="flex items-center gap-3 border border-gray-800 hover:border-gray-600 bg-gray-900/50 px-5 py-3 rounded-2xl transition group">
              <span className="text-gray-400 group-hover:text-white transition">{p.svg}</span>
              <span className="text-gray-400 group-hover:text-white text-sm font-medium transition">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Exemples de hooks */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{t.hooksTitle} <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">{t.hooksTitleAccent}</span></h2>
          <p className="text-gray-400">{t.hooksSub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Cybersécurité", color: "border-blue-500/30 bg-blue-500/5", accent: "text-blue-400", hooks: hooks.cyber },
            { label: "Sport & Fitness", color: "border-pink-500/30 bg-pink-500/5", accent: "text-pink-400", hooks: hooks.sport },
            { label: "Lifestyle", color: "border-violet-500/30 bg-violet-500/5", accent: "text-violet-400", hooks: hooks.lifestyle },
          ].map((cat) => (
            <div key={cat.label} className={`border-2 ${cat.color} rounded-3xl p-6 space-y-4`}>
              <p className={`text-xs font-black tracking-widest uppercase ${cat.accent}`}>{cat.label}</p>
              {cat.hooks.map((hook, i) => (
                <div key={i} className="border border-gray-800 rounded-2xl p-4 bg-black/50">
                  <p className="text-white text-sm leading-relaxed">&ldquo;{hook}&rdquo;</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="px-6 py-20 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t.featuresTitle} <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">{t.featuresTitleAccent}</span></h2>
            <p className="text-gray-400">{t.featuresSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="border-2 border-gray-800 hover:border-pink-500/50 rounded-3xl p-6 transition group bg-black/40 backdrop-blur-sm">
                <h3 className="text-white font-black text-lg mb-2 group-hover:text-pink-400 transition">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16 bg-gradient-to-r from-pink-500/10 to-violet-500/10 border-y border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: "50K+", label: "Hooks générés" },
            { stat: "4", label: "Langues supportées" },
            { stat: "6", label: "Plateformes" },
            { stat: "4.9/5", label: "Note moyenne" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-black bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">{s.stat}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-4">{t.ctaTitle} <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">{t.ctaTitleAccent}</span></h2>
        <p className="text-gray-400 mb-8">{t.ctaSub}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <a href="/app" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition shadow-2xl shadow-pink-500/25">
              {t.openApp}
            </a>
          ) : (
            <a href="/auth" className="bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black text-lg px-8 py-4 rounded-2xl hover:opacity-90 transition shadow-2xl shadow-pink-500/25">
              {t.tryFree}
            </a>
          )}
          <a href="/pricing" className="border-2 border-gray-700 text-gray-300 hover:border-pink-500 hover:text-white font-bold text-lg px-8 py-4 rounded-2xl transition">
            {t.seePricing}
          </a>
        </div>
        <p className="text-xs text-gray-600 mt-4">{t.ctaDisclaimer}</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <img src="/logo.png" alt="HookGenerator" className="h-8 object-contain" />
          <div className="flex gap-6 text-xs text-gray-600">
            <a href="/cgu" className="hover:text-gray-400 transition">{t.cgu}</a>
            <a href="/privacy" className="hover:text-gray-400 transition">{t.confidentialite}</a>
            <a href="/mentions" className="hover:text-gray-400 transition">{t.mentions}</a>
            <a href="mailto:contact@hookgenerator.eu" className="hover:text-gray-400 transition">{t.contact}</a>
          </div>
          <p className="text-xs text-gray-700">© 2025 SB SOLUTION INFO</p>
        </div>
      </footer>
    </main>
  );
}