"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

const FREE_LIMIT = 3;
const CONNECTED_LIMIT = 3;
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

const T = {
  Français: {
    subtitle: "Génère des hooks viraux pour tes vidéos en quelques secondes ⚡",
    tabs: ["⚡ Hooks", "📝 Légende", "💡 Idées", "🔍 Analyser"],
    platform: "Plateforme", tone: "Ton",
    tones: ["Divertissant", "Inspirant", "Éducatif", "Choquant", "Émotionnel", "Storytelling"],
    videoAbout: "Ta vidéo parle de quoi ?", generateHooks: "⚡ Générer mes hooks",
    generating: "⏳ Génération en cours...", generateLegende: "📝 Générer la légende",
    generateIdees: "💡 Générer des idées", analyzeHook: "🔍 Analyser mon hook",
    analyzing: "⏳ Analyse en cours...", whatIsHook: "💡 C'est quoi un hook ?",
    hookExplain1: "Un hook c'est l'accroche des 3 premières secondes de ta vidéo.",
    hookExplain2: "C'est la phrase qui fait que l'utilisateur arrête de scroller.",
    hookExplain3: "Sans bon hook personne ne regarde. Avec un bon hook l'algorithme te pousse.",
    example: "Exemple", hookExample: "Je gagnais 1500€/mois. Voilà comment j'ai tout changé.",
    restart: "← Recommencer", sawAll: "Tu as tout vu !", liked: "Tu as liké", hooks: "hook",
    likedHooks: "Tes hooks likés", savedHooks: "Tes sauvegardes", noSavedHooks: "Aucune sauvegarde pour l'instant.",
    pass: "👎 Passer", like: "❤️ Liker",
    swipe: "Glisse pour passer · Like pour garder", legende: "Légende", hashtags: "Hashtags",
    copy: "📋 Copier", copied: "✅ Copié !", niche: "Ta niche (ex: fitness, finance...)",
    tenIdeas: "10 idées de vidéos 💡", pasteHook: "Colle ton hook ici", note: "Note",
    strengths: "✅ Points forts", weaknesses: "❌ Points faibles", improved: "🚀 Version améliorée",
    login: "Se connecter", logout: "Déconnexion",
    limitFree: "générations gratuites restantes aujourd'hui",
    limitConnected: "générations restantes aujourd'hui",
    unlimited: "✨ Générations illimitées",
    noMore: "Tu as atteint ta limite du jour !",
    noMoreSub: "Connecte-toi pour plus de générations", upgrade: "Se connecter →",
    savedTab: "💾 Sauvegardés", delete: "🗑️",
    loginToSave: "Connecte-toi pour sauvegarder tes contenus !",
    savedLegendes: "Légendes sauvegardées", savedIdees: "Idées sauvegardées", savedHooksTitle: "Hooks sauvegardés",
    saveSuccess: "✅ Sauvegardé !", saveBrief: "💾 Sauvegarder le brief", saveLegende: "💾 Sauvegarder",
    premium: "⭐ Premium",
  },
  English: {
    subtitle: "Generate viral hooks for your videos in seconds ⚡",
    tabs: ["⚡ Hooks", "📝 Caption", "💡 Ideas", "🔍 Analyze"],
    platform: "Platform", tone: "Tone",
    tones: ["Entertaining", "Inspiring", "Educational", "Shocking", "Emotional", "Storytelling"],
    videoAbout: "What is your video about?", generateHooks: "⚡ Generate my hooks",
    generating: "⏳ Generating...", generateLegende: "📝 Generate caption",
    generateIdees: "💡 Generate ideas", analyzeHook: "🔍 Analyze my hook",
    analyzing: "⏳ Analyzing...", whatIsHook: "💡 What is a hook?",
    hookExplain1: "A hook is the opening of the first 3 seconds of your video.",
    hookExplain2: "It makes the user stop scrolling and watch your content to the end.",
    hookExplain3: "No good hook means nobody watches. Good hook means the algorithm pushes you.",
    example: "Example", hookExample: "I was making $1500/month. Here is how I changed everything.",
    restart: "← Start over", sawAll: "You have seen them all!", liked: "You liked", hooks: "hook",
    likedHooks: "Your liked hooks", savedHooks: "Your saves", noSavedHooks: "No saves yet.",
    pass: "👎 Pass", like: "❤️ Like",
    swipe: "Swipe to pass · Like to keep", legende: "Caption", hashtags: "Hashtags",
    copy: "📋 Copy", copied: "✅ Copied!", niche: "Your niche (e.g: fitness, finance...)",
    tenIdeas: "10 video ideas 💡", pasteHook: "Paste your hook here", note: "Score",
    strengths: "✅ Strengths", weaknesses: "❌ Weaknesses", improved: "🚀 Improved version",
    login: "Login", logout: "Logout",
    limitFree: "free generations left today", limitConnected: "generations left today",
    unlimited: "✨ Unlimited generations",
    noMore: "You have reached your daily limit!", noMoreSub: "Login for more generations",
    upgrade: "Login →",
    savedTab: "💾 Saved", delete: "🗑️",
    loginToSave: "Login to save your content!",
    savedLegendes: "Saved captions", savedIdees: "Saved ideas", savedHooksTitle: "Saved hooks",
    saveSuccess: "✅ Saved!", saveBrief: "💾 Save brief", saveLegende: "💾 Save",
    premium: "⭐ Premium",
  },
  Español: {
    subtitle: "Genera hooks virales para tus videos en segundos ⚡",
    tabs: ["⚡ Hooks", "📝 Leyenda", "💡 Ideas", "🔍 Analizar"],
    platform: "Plataforma", tone: "Tono",
    tones: ["Entretenido", "Inspirador", "Educativo", "Impactante", "Emocional", "Storytelling"],
    videoAbout: "De que trata tu video?", generateHooks: "⚡ Generar mis hooks",
    generating: "⏳ Generando...", generateLegende: "📝 Generar leyenda",
    generateIdees: "💡 Generar ideas", analyzeHook: "🔍 Analizar mi hook",
    analyzing: "⏳ Analizando...", whatIsHook: "Que es un hook?",
    hookExplain1: "Un hook es la introduccion de los primeros 3 segundos de tu video.",
    hookExplain2: "Es la frase que hace que el usuario deje de hacer scroll.",
    hookExplain3: "Sin buen hook nadie mira. Con buen hook el algoritmo te impulsa.",
    example: "Ejemplo", hookExample: "Ganaba 1500 euros al mes. Asi cambie todo.",
    restart: "← Volver", sawAll: "Los has visto todos!", liked: "Te gustaron", hooks: "hook",
    likedHooks: "Tus hooks favoritos", savedHooks: "Tus guardados", noSavedHooks: "No hay guardados aún.",
    pass: "👎 Pasar", like: "❤️ Me gusta",
    swipe: "Desliza para pasar · Like para guardar", legende: "Leyenda", hashtags: "Hashtags",
    copy: "📋 Copiar", copied: "✅ Copiado!", niche: "Tu nicho (ej: fitness, finanzas...)",
    tenIdeas: "10 ideas de videos 💡", pasteHook: "Pega tu hook aqui", note: "Puntuacion",
    strengths: "✅ Puntos fuertes", weaknesses: "❌ Puntos debiles", improved: "🚀 Version mejorada",
    login: "Iniciar sesion", logout: "Cerrar sesion",
    limitFree: "generaciones gratuitas hoy", limitConnected: "generaciones restantes hoy",
    unlimited: "✨ Generaciones ilimitadas",
    noMore: "Has alcanzado tu limite diario!", noMoreSub: "Inicia sesion para mas generaciones",
    upgrade: "Iniciar sesion →",
    savedTab: "💾 Guardados", delete: "🗑️",
    loginToSave: "Inicia sesion para guardar tu contenido!",
    savedLegendes: "Leyendas guardadas", savedIdees: "Ideas guardadas", savedHooksTitle: "Hooks guardados",
    saveSuccess: "✅ Guardado!", saveBrief: "💾 Guardar brief", saveLegende: "💾 Guardar",
    premium: "⭐ Premium",
  },
  Português: {
    subtitle: "Gere hooks virais para seus videos em segundos ⚡",
    tabs: ["⚡ Hooks", "📝 Legenda", "💡 Ideias", "🔍 Analisar"],
    platform: "Plataforma", tone: "Tom",
    tones: ["Divertido", "Inspirador", "Educativo", "Chocante", "Emocional", "Storytelling"],
    videoAbout: "Do que e o seu video?", generateHooks: "⚡ Gerar meus hooks",
    generating: "⏳ Gerando...", generateLegende: "📝 Gerar legenda",
    generateIdees: "💡 Gerar ideias", analyzeHook: "🔍 Analisar meu hook",
    analyzing: "⏳ Analisando...", whatIsHook: "O que e um hook?",
    hookExplain1: "Um hook e a introducao dos primeiros 3 segundos do seu video.",
    hookExplain2: "E a frase que faz o usuario parar de rolar e assistir seu conteudo.",
    hookExplain3: "Sem bom hook ninguem assiste. Com bom hook o algoritmo te impulsiona.",
    example: "Exemplo", hookExample: "Eu ganhava R$1500/mes. Veja como mudei tudo.",
    restart: "← Recomecar", sawAll: "Voce viu todos!", liked: "Voce curtiu", hooks: "hook",
    likedHooks: "Seus hooks curtidos", savedHooks: "Seus salvos", noSavedHooks: "Nenhum salvo ainda.",
    pass: "👎 Passar", like: "❤️ Curtir",
    swipe: "Deslize para passar · Curta para guardar", legende: "Legenda", hashtags: "Hashtags",
    copy: "📋 Copiar", copied: "✅ Copiado!", niche: "Seu nicho (ex: fitness, financas...)",
    tenIdeas: "10 ideias de videos 💡", pasteHook: "Cole seu hook aqui", note: "Nota",
    strengths: "✅ Pontos fortes", weaknesses: "❌ Pontos fracos", improved: "🚀 Versao melhorada",
    login: "Entrar", logout: "Sair",
    limitFree: "geracoes gratuitas restantes hoje", limitConnected: "geracoes restantes hoje",
    unlimited: "✨ Geracoes ilimitadas",
    noMore: "Voce atingiu seu limite diario!", noMoreSub: "Entre para mais geracoes",
    upgrade: "Entrar →",
    savedTab: "💾 Salvos", delete: "🗑️",
    loginToSave: "Entre para salvar seu conteudo!",
    savedLegendes: "Legendas salvas", savedIdees: "Ideias salvas", savedHooksTitle: "Hooks salvos",
    saveSuccess: "✅ Salvo!", saveBrief: "💾 Salvar brief", saveLegende: "💾 Salvar",
    premium: "⭐ Premium",
  },
};

function PlatformSelect({ value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const categories = [
    { label: "📱 Social", options: ["TikTok", "Instagram Reels", "Snapchat", "Facebook", "Pinterest"] },
    { label: "💼 Pro", options: ["LinkedIn"] },
    { label: "🎬 Video", options: ["YouTube Shorts"] },
    { label: "💬 Micro", options: ["Twitter / X"] },
  ];
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)} className="w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 pt-7 pb-3 text-white cursor-pointer flex justify-between items-center hover:border-pink-500 transition">
        <span className="text-sm">{value}</span>
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </div>
      <label className="absolute left-5 top-2 text-xs font-black tracking-widest uppercase text-pink-400 pointer-events-none">{t.platform}</label>
      {open && (
        <div className="absolute z-10 w-full mt-2 bg-gray-950 border-2 border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          {categories.map((cat) => (
            <div key={cat.label}>
              <div className="px-5 py-2 text-xs font-black tracking-widest uppercase text-gray-600 bg-gray-900">{cat.label}</div>
              {cat.options.map((opt) => (
                <div key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`px-5 py-3 text-sm cursor-pointer transition flex justify-between items-center ${value === opt ? "text-pink-400 bg-pink-500/10" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
                  {opt}{value === opt && <span>✓</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomSelect({ value, onChange, options, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)} className="w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 pt-7 pb-3 text-white cursor-pointer flex justify-between items-center hover:border-pink-500 transition">
        <span className="text-sm">{value}</span>
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </div>
      <label className="absolute left-5 top-2 text-xs font-black tracking-widest uppercase text-pink-400 pointer-events-none">{label}</label>
      {open && (
        <div className="absolute z-10 w-full mt-2 bg-gray-950 border-2 border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          {options.map((opt) => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`px-5 py-3 text-sm cursor-pointer transition flex justify-between items-center ${value === opt ? "text-pink-400 bg-pink-500/10" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}>
              {opt}{value === opt && <span>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TinderCard({ hooks, onLike, liked, t, user, platform, tone, langue }) {
  const [current, setCurrent] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [direction, setDirection] = useState(null);
  const startX = useRef(null);
  const md = (e) => { startX.current = e.clientX; setDragging(true); };
  const mm = (e) => { if (!dragging) return; setDrag(e.clientX - startX.current); };
  const mu = () => { if (drag > 80) hl(); else if (drag < -80) hp(); setDrag(0); setDragging(false); };
  const ts = (e) => { startX.current = e.touches[0].clientX; setDragging(true); };
  const tm = (e) => { if (!dragging) return; setDrag(e.touches[0].clientX - startX.current); };
  const saveHookToSupabase = async (hookText) => {
    if (!user) return;
    await supabase.from("liked_hooks").insert({ user_id: user.id, hook: hookText, platform, tone, langue });
  };
  const hl = () => {
    if (current >= hooks.length) return;
    setDirection("right");
    const hookText = hooks[current];
    onLike(hookText);
    saveHookToSupabase(hookText);
    setTimeout(() => { setCurrent((c) => c + 1); setDirection(null); }, 300);
  };
  const hp = () => {
    if (current >= hooks.length) return;
    setDirection("left");
    setTimeout(() => { setCurrent((c) => c + 1); setDirection(null); }, 300);
  };
  const copy = (text) => navigator.clipboard.writeText(text);
  if (current >= hooks.length) {
    return (
      <div className="border-2 border-gray-800 rounded-3xl p-8 text-center">
        <p className="text-4xl mb-4">🎉</p>
        <h3 className="text-xl font-bold text-white mb-2">{t.sawAll}</h3>
        <p className="text-gray-400 text-sm mb-6">{t.liked} {liked.length} {t.hooks}{liked.length > 1 ? "s" : ""}</p>
        {!user && liked.length > 0 && (
          <div className="border-2 border-pink-500/30 bg-pink-500/5 rounded-2xl p-4 mb-4">
            <p className="text-pink-400 text-sm font-medium">{t.loginToSave}</p>
            <a href="/auth" className="inline-block mt-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2 px-5 rounded-full text-sm">{t.login} →</a>
          </div>
        )}
        {user && liked.length > 0 && <p className="text-green-400 text-sm mb-4">{t.saveSuccess}</p>}
        {liked.length > 0 && (
          <div className="space-y-3 text-left">
            <p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-3">{t.likedHooks}</p>
            {liked.map((h, i) => (
              <div key={i} onClick={() => copy(h)} className="border-2 border-pink-500/30 bg-pink-500/5 hover:border-pink-500 rounded-2xl p-4 text-sm text-white cursor-pointer transition flex justify-between items-center gap-3">
                <span>{h}</span><span className="text-gray-500 text-lg shrink-0">📋</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  const rotate = drag / 15;
  const lo = Math.min(1, drag / 80);
  const po = Math.min(1, -drag / 80);
  return (
    <div className="relative">
      <div className="flex gap-1 mb-4">
        {hooks.map((_, i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < current ? "bg-pink-500" : i === current ? "bg-pink-500/50" : "bg-gray-800"}`} />))}
      </div>
      <div className={`border-2 rounded-3xl p-8 cursor-grab active:cursor-grabbing select-none ${direction === "right" ? "translate-x-full opacity-0 rotate-12" : direction === "left" ? "-translate-x-full opacity-0 -rotate-12" : "border-gray-800"}`}
        style={{ transform: direction ? undefined : `translateX(${drag}px) rotate(${rotate}deg)`, transition: dragging ? "none" : "all 0.3s" }}
        onMouseDown={md} onMouseMove={mm} onMouseUp={mu}
        onMouseLeave={() => { if (dragging) { setDrag(0); setDragging(false); } }}
        onTouchStart={ts} onTouchMove={tm} onTouchEnd={mu}>
        <div className="absolute top-6 left-6 border-4 border-green-400 text-green-400 font-black text-2xl px-3 py-1 rounded-xl rotate-[-20deg]" style={{ opacity: lo }}>LIKE ❤️</div>
        <div className="absolute top-6 right-6 border-4 border-red-400 text-red-400 font-black text-2xl px-3 py-1 rounded-xl rotate-[20deg]" style={{ opacity: po }}>PASS 👎</div>
        <div className="text-center mb-6"><span className="text-2xl font-black text-pink-400">Hook #{current + 1}</span></div>
        <p className="text-white text-xl font-bold leading-relaxed text-center min-h-32 flex items-center justify-center border-2 border-gray-800 rounded-3xl px-6 py-4 w-full">{hooks[current]}</p>
        <p className="text-gray-600 text-xs text-center mt-6">{t.swipe}</p>
      </div>
      <div className="flex gap-4 mt-4">
        <button onClick={hp} className="flex-1 border-2 border-gray-800 hover:border-red-400 text-gray-400 hover:text-red-400 py-4 rounded-3xl font-bold transition text-xl">{t.pass}</button>
        <button onClick={hl} className="flex-1 border-2 border-gray-800 hover:border-green-400 text-gray-400 hover:text-green-400 py-4 rounded-3xl font-bold transition text-xl">{t.like}</button>
      </div>
    </div>
  );
}

function LegendeTab({ platform, langue, t, user, state, setState }) {
  const { description, result, saved } = state;
  const setDescription = (v) => setState(s => ({ ...s, description: v }));
  const setResult = (v) => setState(s => ({ ...s, result: v }));
  const setSaved = (v) => setState(s => ({ ...s, saved: v }));
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const generate = async () => {
    if (!description) return;
    setLoading(true); setResult(""); setSaved(false);
    const res = await fetch("/api/legende", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description, platform, langue }) });
    const data = await res.json();
    setResult(data.result); setLoading(false);
  };
  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  const parseLegende = (text) => {
    if (!text) return { legende: "", hashtags: "" };
    const parts = text.split(/HASHTAGS:/i);
    return { legende: parts[0].replace(/LEGENDE:|CAPTION:|LEGENDA:|LEYENDA:/i, "").replace(/\*\*/g, "").trim(), hashtags: parts[1] ? parts[1].replace(/\*\*/g, "").trim() : "" };
  };
  const { legende, hashtags } = parseLegende(result);
  const saveToSupabase = async () => {
    if (!user || !legende) return;
    await supabase.from("liked_legendes").insert({ user_id: user.id, legende, hashtags, platform, langue });
    setSaved(true);
  };
  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea id="legende-desc" className="peer w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 pt-7 pb-3 text-white placeholder-transparent focus:outline-none focus:border-pink-500 transition resize-none h-28" placeholder="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <label htmlFor="legende-desc" className="absolute left-5 top-2 text-xs font-black tracking-widest uppercase text-pink-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-pink-400 transition-all pointer-events-none">{t.videoAbout}</label>
      </div>
      <button onClick={generate} disabled={loading || !description} className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-3xl hover:opacity-90 disabled:opacity-50 transition text-lg">{loading ? t.generating : t.generateLegende}</button>
      {result && (
        <div className="space-y-3">
          {legende && (<div className="border-2 border-gray-800 rounded-3xl p-5"><div className="flex justify-between items-center mb-3"><span className="text-xs font-black tracking-widest uppercase text-pink-400">{t.legende}</span><button onClick={() => copy(legende, "legende")} className="text-xs text-gray-500 hover:text-pink-400 transition">{copied === "legende" ? t.copied : t.copy}</button></div><p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{legende}</p></div>)}
          {hashtags && (<div className="border-2 border-gray-800 rounded-3xl p-5"><div className="flex justify-between items-center mb-3"><span className="text-xs font-black tracking-widest uppercase text-pink-400">{t.hashtags}</span><button onClick={() => copy(hashtags, "hashtags")} className="text-xs text-gray-500 hover:text-pink-400 transition">{copied === "hashtags" ? t.copied : t.copy}</button></div><p className="text-pink-300 text-sm leading-relaxed">{hashtags}</p></div>)}
          {user ? (
            <button onClick={saveToSupabase} disabled={saved} className="w-full border-2 border-pink-500/50 hover:border-pink-500 text-pink-400 py-3 rounded-3xl transition text-sm font-medium disabled:opacity-50">{saved ? t.saveSuccess : t.saveLegende}</button>
          ) : (
            <p className="text-center text-xs text-gray-500">{t.loginToSave}</p>
          )}
          <button onClick={() => { setResult(""); setSaved(false); }} className="w-full border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 py-3 rounded-3xl transition text-sm font-medium">{t.restart}</button>
        </div>
      )}
    </div>
  );
}

function IdeesTab({ platform, langue, t, user, state, setState }) {
  const { niche, result, selectedIdee, prompt, saved } = state;
  const setNiche = (v) => setState(s => ({ ...s, niche: v }));
  const setResult = (v) => setState(s => ({ ...s, result: v }));
  const setSelectedIdee = (v) => setState(s => ({ ...s, selectedIdee: v }));
  const setPrompt = (v) => setState(s => ({ ...s, prompt: v }));
  const setSaved = (v) => setState(s => ({ ...s, saved: v }));
  const [loading, setLoading] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [copied, setCopied] = useState(null);
  const generate = async () => {
    if (!niche) return;
    setLoading(true); setResult(""); setSelectedIdee(null); setPrompt(""); setSaved(false);
    const res = await fetch("/api/idees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ niche, platform, langue }) });
    const data = await res.json();
    setResult(data.result); setLoading(false);
  };
  const generatePrompt = async (idee) => {
    setSelectedIdee(idee); setPrompt(""); setLoadingPrompt(true); setSaved(false);
    const res = await fetch("/api/prompt-idee", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idee, niche, platform, langue }) });
    const data = await res.json();
    setPrompt(data.result); setLoadingPrompt(false);
  };
  const saveToSupabase = async () => {
    if (!user || !selectedIdee) return;
    await supabase.from("liked_idees").insert({ user_id: user.id, idee: selectedIdee, brief: prompt, platform, langue });
    setSaved(true);
  };
  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  const parsePrompt = (text) => {
    if (!text) return {};
    const hook = text.match(/HOOK:\s*([\s\S]*?)(?=ANGLE:|$)/i)?.[1]?.trim() || "";
    const angle = text.match(/ANGLE:\s*([\s\S]*?)(?=STRUCTURE:|$)/i)?.[1]?.trim() || "";
    const structure = text.match(/STRUCTURE:\s*([\s\S]*?)(?=CALL TO ACTION:|$)/i)?.[1]?.trim() || "";
    const cta = text.match(/CALL TO ACTION:\s*([\s\S]*?)(?=ASTUCE:|$)/i)?.[1]?.trim() || "";
    const astuce = text.match(/ASTUCE:\s*([\s\S]*?)$/i)?.[1]?.trim() || "";
    return { hook, angle, structure, cta, astuce };
  };
  const idees = result ? result.split("\n").map((l) => { const m = l.match(/^\d+[\.\)]\s*(.+)$/); return m ? m[1].replace(/\*\*/g, "").trim() : null; }).filter(Boolean) : [];
  const { hook, angle, structure, cta, astuce } = parsePrompt(prompt);
  const labels = {
    Français: { hook: "🎣 Hook", angle: "🎯 Angle", structure: "📋 Structure", cta: "📣 Call to action", astuce: "💡 Astuce viralité", back: "← Retour aux idées", generating: "⏳ Génération...", copyAll: "📋 Tout copier" },
    English: { hook: "🎣 Hook", angle: "🎯 Angle", structure: "📋 Structure", cta: "📣 Call to action", astuce: "💡 Virality tip", back: "← Back to ideas", generating: "⏳ Generating...", copyAll: "📋 Copy all" },
    Español: { hook: "🎣 Hook", angle: "🎯 Ángulo", structure: "📋 Estructura", cta: "📣 Call to action", astuce: "💡 Consejo viral", back: "← Volver a ideas", generating: "⏳ Generando...", copyAll: "📋 Copiar todo" },
    Português: { hook: "🎣 Hook", angle: "🎯 Ângulo", structure: "📋 Estrutura", cta: "📣 Call to action", astuce: "💡 Dica viral", back: "← Voltar às ideias", generating: "⏳ Gerando...", copyAll: "📋 Copiar tudo" },
  };
  const l = labels[langue] || labels["Français"];
  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea id="niche" className="peer w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 pt-7 pb-3 text-white placeholder-transparent focus:outline-none focus:border-pink-500 transition resize-none h-24" placeholder="niche" value={niche} onChange={(e) => setNiche(e.target.value)} />
        <label htmlFor="niche" className="absolute left-5 top-2 text-xs font-black tracking-widest uppercase text-pink-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-pink-400 transition-all pointer-events-none">{t.niche}</label>
      </div>
      <button onClick={generate} disabled={loading || !niche} className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-3xl hover:opacity-90 disabled:opacity-50 transition text-lg">{loading ? t.generating : t.generateIdees}</button>
      {idees.length > 0 && !selectedIdee && (
        <div className="border-2 border-gray-800 rounded-3xl p-6 space-y-3">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-4">{t.tenIdeas}</p>
          {idees.map((idee, i) => (
            <div key={i} onClick={() => generatePrompt(idee)} className="flex items-start gap-3 border-2 border-gray-800 hover:border-pink-500 rounded-2xl p-4 cursor-pointer transition group">
              <span className="text-pink-500 font-black text-lg shrink-0">{i + 1}</span>
              <p className="text-white text-sm flex-1">{idee}</p>
              <span className="text-gray-600 group-hover:text-pink-400 transition text-xs shrink-0">✨ Brief</span>
            </div>
          ))}
          <button onClick={() => { setResult(""); setSelectedIdee(null); setPrompt(""); }} className="w-full border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 py-3 rounded-3xl transition text-sm font-medium mt-2">{t.restart}</button>
        </div>
      )}
      {selectedIdee && (
        <div className="space-y-3">
          <button onClick={() => { setSelectedIdee(null); setPrompt(""); setSaved(false); }} className="text-xs text-gray-500 hover:text-pink-400 transition font-medium">{l.back}</button>
          <div className="border-2 border-pink-500/30 bg-pink-500/5 rounded-3xl p-4">
            <p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-1">Idée</p>
            <p className="text-white text-sm font-bold">{selectedIdee}</p>
          </div>
          {loadingPrompt && <div className="border-2 border-gray-800 rounded-3xl p-8 text-center"><p className="text-gray-400 text-sm">{l.generating}</p></div>}
          {prompt && !loadingPrompt && (
            <div className="space-y-3">
              {hook && (<div className="border-2 border-gray-800 rounded-3xl p-5"><div className="flex justify-between items-center mb-2"><p className="text-xs font-black tracking-widest uppercase text-pink-400">{l.hook}</p><button onClick={() => copy(hook, "hook")} className="text-xs text-gray-500 hover:text-pink-400 transition">{copied === "hook" ? t.copied : t.copy}</button></div><p className="text-white text-sm font-bold">{hook}</p></div>)}
              {angle && (<div className="border-2 border-gray-800 rounded-3xl p-5"><p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-2">{l.angle}</p><p className="text-white text-sm">{angle}</p></div>)}
              {structure && (<div className="border-2 border-gray-800 rounded-3xl p-5"><p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-2">{l.structure}</p><p className="text-white text-sm whitespace-pre-wrap">{structure}</p></div>)}
              {cta && (<div className="border-2 border-gray-800 rounded-3xl p-5"><div className="flex justify-between items-center mb-2"><p className="text-xs font-black tracking-widest uppercase text-pink-400">{l.cta}</p><button onClick={() => copy(cta, "cta")} className="text-xs text-gray-500 hover:text-pink-400 transition">{copied === "cta" ? t.copied : t.copy}</button></div><p className="text-white text-sm font-bold">{cta}</p></div>)}
              {astuce && (<div className="border-2 border-violet-500/30 bg-violet-500/5 rounded-3xl p-5"><p className="text-xs font-black tracking-widest uppercase text-violet-400 mb-2">{l.astuce}</p><p className="text-white text-sm">{astuce}</p></div>)}
              {user ? (
                <button onClick={saveToSupabase} disabled={saved} className="w-full border-2 border-pink-500/50 hover:border-pink-500 text-pink-400 py-3 rounded-3xl transition text-sm font-medium disabled:opacity-50">{saved ? t.saveSuccess : t.saveBrief}</button>
              ) : (
                <p className="text-center text-xs text-gray-500">{t.loginToSave}</p>
              )}
              <button onClick={() => copy(hook + "\n\n" + angle + "\n\n" + structure + "\n\n" + cta + "\n\n" + astuce, "all")} className="w-full border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 py-3 rounded-3xl transition text-sm font-medium">{copied === "all" ? t.copied : l.copyAll}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnalyseTab({ platform, langue, t, state, setState }) {
  const { hook, result } = state;
  const setHook = (v) => setState(s => ({ ...s, hook: v }));
  const setResult = (v) => setState(s => ({ ...s, result: v }));
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const generate = async () => {
    if (!hook) return;
    setLoading(true); setResult("");
    const res = await fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hook, platform, langue }) });
    const data = await res.json();
    setResult(data.result); setLoading(false);
  };
  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  const parse = (text) => {
    if (!text) return {};
    const note = text.match(/(?:NOTE|SCORE|PUNTUACION|NOTA):\s*(\d+\/10)/i)?.[1] || "";
    const forts = text.match(/(?:POINTS FORTS|STRENGTHS|PUNTOS FUERTES|PONTOS FORTES):\s*([\s\S]*?)(?=(?:POINTS FAIBLES|WEAKNESSES|PUNTOS DEBILES|PONTOS FRACOS):|$)/i)?.[1]?.replace(/\*\*/g, "").trim() || "";
    const faibles = text.match(/(?:POINTS FAIBLES|WEAKNESSES|PUNTOS DEBILES|PONTOS FRACOS):\s*([\s\S]*?)(?=(?:VERSION AMELIOREE|IMPROVED VERSION|VERSION MEJORADA|VERSAO MELHORADA):|$)/i)?.[1]?.replace(/\*\*/g, "").trim() || "";
    const ameliore = text.match(/(?:VERSION AMELIOREE|IMPROVED VERSION|VERSION MEJORADA|VERSAO MELHORADA):\s*([\s\S]*?)$/i)?.[1]?.replace(/\*\*/g, "").trim() || "";
    return { note, forts, faibles, ameliore };
  };
  const { note, forts, faibles, ameliore } = parse(result);
  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea id="hook-analyse" className="peer w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 pt-7 pb-3 text-white placeholder-transparent focus:outline-none focus:border-pink-500 transition resize-none h-28" placeholder="hook" value={hook} onChange={(e) => setHook(e.target.value)} />
        <label htmlFor="hook-analyse" className="absolute left-5 top-2 text-xs font-black tracking-widest uppercase text-pink-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-pink-400 transition-all pointer-events-none">{t.pasteHook}</label>
      </div>
      <button onClick={generate} disabled={loading || !hook} className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-3xl hover:opacity-90 disabled:opacity-50 transition text-lg">{loading ? t.analyzing : t.analyzeHook}</button>
      {result && (
        <div className="space-y-3">
          {note && <div className="border-2 border-gray-800 rounded-3xl p-5 text-center"><p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-2">{t.note}</p><p className="text-5xl font-black text-white">{note}</p></div>}
          {forts && <div className="border-2 border-green-500/30 bg-green-500/5 rounded-3xl p-5"><p className="text-xs font-black tracking-widest uppercase text-green-400 mb-3">{t.strengths}</p><p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{forts}</p></div>}
          {faibles && <div className="border-2 border-red-500/30 bg-red-500/5 rounded-3xl p-5"><p className="text-xs font-black tracking-widest uppercase text-red-400 mb-3">{t.weaknesses}</p><p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{faibles}</p></div>}
          {ameliore && (<div className="border-2 border-pink-500/30 bg-pink-500/5 rounded-3xl p-5"><div className="flex justify-between items-center mb-3"><p className="text-xs font-black tracking-widest uppercase text-pink-400">{t.improved}</p><button onClick={() => copy(ameliore, "ameliore")} className="text-xs text-gray-500 hover:text-pink-400 transition">{copied === "ameliore" ? t.copied : t.copy}</button></div><p className="text-white text-sm leading-relaxed font-bold">{ameliore}</p></div>)}
          <button onClick={() => setResult("")} className="w-full border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 py-3 rounded-3xl transition text-sm font-medium">{t.restart}</button>
        </div>
      )}
    </div>
  );
}

function SavedTab({ user, t }) {
  const [hooks, setHooks] = useState([]);
  const [idees, setIdees] = useState([]);
  const [legendes, setLegendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [section, setSection] = useState("hooks");
  const [expandedIdee, setExpandedIdee] = useState(null);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchAll = async () => {
      const [h, i, l] = await Promise.all([
        supabase.from("liked_hooks").select("*").order("created_at", { ascending: false }),
        supabase.from("liked_idees").select("*").order("created_at", { ascending: false }),
        supabase.from("liked_legendes").select("*").order("created_at", { ascending: false }),
      ]);
      setHooks(h.data || []); setIdees(i.data || []); setLegendees(l.data || []);
      setLoading(false);
    };
    fetchAll();
  }, [user]);
  const deleteItem = async (table, id, setter) => {
    await supabase.from(table).delete().eq("id", id);
    setter((prev) => prev.filter((x) => x.id !== id));
  };
  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  if (!user) return (
    <div className="border-2 border-gray-800 rounded-3xl p-8 text-center">
      <p className="text-4xl mb-4">🔒</p>
      <p className="text-white font-bold mb-2">{t.loginToSave}</p>
      <a href="/auth" className="inline-block mt-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2 px-6 rounded-full text-sm">{t.login} →</a>
    </div>
  );
  if (loading) return <div className="text-center text-gray-500 py-12">⏳</div>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 bg-gray-900 p-1 rounded-3xl">
        {[["hooks", `🎣 (${hooks.length})`], ["idees", `💡 (${idees.length})`], ["legendes", `📝 (${legendes.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)} className={`py-2.5 rounded-3xl text-xs font-bold transition ${section === id ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white" : "text-gray-400 hover:text-white"}`}>{label}</button>
        ))}
      </div>
      {section === "hooks" && (
        <div className="space-y-3">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400">{t.savedHooksTitle} ({hooks.length})</p>
          {hooks.length === 0 && <p className="text-gray-500 text-sm text-center py-8">{t.noSavedHooks}</p>}
          {hooks.map((h) => (
            <div key={h.id} className="border-2 border-gray-800 hover:border-pink-500 rounded-2xl p-4 transition">
              <p className="text-white text-sm mb-3">{h.hook}</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 flex-wrap">
                  {h.platform && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{h.platform}</span>}
                  {h.tone && <span className="text-xs bg-pink-500/10 text-pink-400 px-2 py-1 rounded-full">{h.tone}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copy(h.hook, h.id)} className="text-xs text-gray-500 hover:text-pink-400 transition px-2 py-1">{copied === h.id ? "✅" : "📋"}</button>
                  <button onClick={() => deleteItem("liked_hooks", h.id, setHooks)} className="text-xs text-gray-500 hover:text-red-400 transition px-2 py-1">{t.delete}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {section === "idees" && (
        <div className="space-y-3">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400">{t.savedIdees} ({idees.length})</p>
          {idees.length === 0 && <p className="text-gray-500 text-sm text-center py-8">{t.noSavedHooks}</p>}
          {idees.map((item) => (
            <div key={item.id} className="border-2 border-gray-800 hover:border-pink-500 rounded-2xl p-4 transition">
              <div className="flex justify-between items-start gap-2 mb-2">
                <p className="text-white text-sm font-bold flex-1">{item.idee}</p>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setExpandedIdee(expandedIdee === item.id ? null : item.id)} className="text-xs text-gray-500 hover:text-pink-400 transition px-2 py-1">{expandedIdee === item.id ? "▲" : "▼ Brief"}</button>
                  <button onClick={() => deleteItem("liked_idees", item.id, setIdees)} className="text-xs text-gray-500 hover:text-red-400 transition px-2 py-1">{t.delete}</button>
                </div>
              </div>
              {item.platform && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{item.platform}</span>}
              {expandedIdee === item.id && item.brief && (
                <div className="mt-3 border-t border-gray-800 pt-3">
                  <p className="text-gray-400 text-xs whitespace-pre-wrap">{item.brief}</p>
                  <button onClick={() => copy(item.brief, item.id + "brief")} className="text-xs text-gray-500 hover:text-pink-400 transition mt-2">{copied === item.id + "brief" ? "✅" : "📋 " + t.copy}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {section === "legendes" && (
        <div className="space-y-3">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400">{t.savedLegendes} ({legendes.length})</p>
          {legendes.length === 0 && <p className="text-gray-500 text-sm text-center py-8">{t.noSavedHooks}</p>}
          {legendes.map((item) => (
            <div key={item.id} className="border-2 border-gray-800 hover:border-pink-500 rounded-2xl p-4 transition">
              <p className="text-white text-sm mb-2 whitespace-pre-wrap">{item.legende}</p>
              {item.hashtags && <p className="text-pink-300 text-xs mb-3">{item.hashtags}</p>}
              <div className="flex justify-between items-center">
                {item.platform && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{item.platform}</span>}
                <div className="flex gap-2">
                  <button onClick={() => copy(item.legende + "\n\n" + item.hashtags, item.id)} className="text-xs text-gray-500 hover:text-pink-400 transition px-2 py-1">{copied === item.id ? "✅" : "📋"}</button>
                  <button onClick={() => deleteItem("liked_legendes", item.id, setLegendees)} className="text-xs text-gray-500 hover:text-red-400 transition px-2 py-1">{t.delete}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState("hooks");
  const [platform, setPlatform] = useState("TikTok");
  const [tone, setTone] = useState("Divertissant");
  const [langue, setLangue] = useState("Français");
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [generationsLeft, setGenerationsLeft] = useState(null);
  const [loadingHooks, setLoadingHooks] = useState(false);

  const [hooksState, setHooksState] = useState({ description: "", result: "", liked: [] });
  const [legendeState, setLegendeState] = useState({ description: "", result: "", saved: false });
  const [ideesState, setIdeesState] = useState({ niche: "", result: "", selectedIdee: null, prompt: "", saved: false });
  const [analyseState, setAnalyseState] = useState({ hook: "", result: "" });

  const t = T[langue];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setIsPremium(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("user_profiles").select("is_premium").eq("id", userId).single();
    if (data) setIsPremium(data.is_premium === true);
  };

  useEffect(() => {
    if (isPremium) setGenerationsLeft(null); // null = illimité
    else if (user) setGenerationsLeft(CONNECTED_LIMIT);
    else setGenerationsLeft(FREE_LIMIT - getLocalGenerations());
  }, [user, isPremium]);

  const handleLangueChange = (l) => {
    setLangue(l); setTone(T[l].tones[0]);
    setHooksState({ description: "", result: "", liked: [] });
    setLegendeState({ description: "", result: "", saved: false });
    setIdeesState({ niche: "", result: "", selectedIdee: null, prompt: "", saved: false });
    setAnalyseState({ hook: "", result: "" });
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setIsPremium(false); };
  const canGenerate = isPremium || generationsLeft === null || generationsLeft > 0;

  const generateHooks = async () => {
  if (!hooksState.description || !canGenerate) return;
  setLoadingHooks(true);
  setHooksState(s => ({ ...s, result: "", liked: [] }));
  if (!user) { incrementLocalGenerations(); setGenerationsLeft(FREE_LIMIT - getLocalGenerations()); }
  else if (!isPremium) setGenerationsLeft((g) => g - 1);

  // Récupérer le token session
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers,
    body: JSON.stringify({ description: hooksState.description, platform, tone, langue }),
  });
  const data = await res.json();
  setHooksState(s => ({ ...s, result: data.result }));
  setLoadingHooks(false);
};
  };

  const parseHooks = (text) => {
    if (!text) return [];
    return text.split("\n").map((line) => { const m = line.match(/^\d+[\.\)]\s*(.+)$/); if (!m) return null; return m[1].replace(/\*\*/g, "").replace(/\s*\(.*?\)/g, "").replace(/^["'"]+|["'"]+$/g, "").trim(); }).filter(Boolean);
  };

  const hooks = parseHooks(hooksState.result);
  const tabIds = ["hooks", "legende", "idees", "analyse", "saved"];
  const langues = [{ id: "Français", flag: "🇫🇷" }, { id: "English", flag: "🇬🇧" }, { id: "Español", flag: "🇪🇸" }, { id: "Português", flag: "🇧🇷" }];

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div />
          {user ? (
            <div className="flex items-center gap-3">
              {isPremium && <span className="text-xs bg-gradient-to-r from-pink-500 to-violet-500 text-white px-2 py-1 rounded-full font-bold">{t.premium}</span>}
              <span className="text-xs text-gray-400">{user.email}</span>
              <button onClick={handleLogout} className="text-xs border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 px-3 py-1.5 rounded-full transition">{t.logout}</button>
            </div>
          ) : (
            <a href="/auth" className="text-xs border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 px-3 py-1.5 rounded-full transition">{t.login}</a>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">HookGenerator</h1>
          <p className="text-gray-400 mb-4">{t.subtitle}</p>
          <div className={`text-xs mb-4 font-medium ${!isPremium && generationsLeft <= 1 ? "text-red-400" : "text-gray-500"}`}>
            {isPremium ? t.unlimited : (canGenerate && generationsLeft !== null ? `${generationsLeft} ${user ? t.limitConnected : t.limitFree}` : "")}
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {langues.map((l) => (
              <button key={l.id} onClick={() => handleLangueChange(l.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition ${langue === l.id ? "border-pink-500 text-pink-400 bg-pink-500/10" : "border-gray-800 text-gray-500 hover:border-gray-600"}`}>
                {l.flag} {l.id}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1 bg-gray-900 p-1 rounded-3xl">
            {tabIds.map((id, i) => (
              <button key={id} onClick={() => setTab(id)}
                className={`py-2.5 rounded-3xl text-xs font-bold transition ${tab === id ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white" : "text-gray-400 hover:text-white"}`}>
                {id === "saved" ? t.savedTab : t.tabs[i]}
              </button>
            ))}
          </div>
        </div>

        {tab === "hooks" && (
          !hooksState.result ? (
            <div className="space-y-4 mb-6">
              <div className="relative">
                <textarea id="description" className="peer w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 pt-7 pb-3 text-white placeholder-transparent focus:outline-none focus:border-pink-500 transition resize-none h-28" placeholder="description" value={hooksState.description} onChange={(e) => setHooksState(s => ({ ...s, description: e.target.value }))} />
                <label htmlFor="description" className="absolute left-5 top-2 text-xs font-black tracking-widest uppercase text-pink-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-pink-400 transition-all pointer-events-none">{t.videoAbout}</label>
              </div>
              <PlatformSelect value={platform} onChange={setPlatform} t={t} />
              <CustomSelect label={t.tone} value={tone} onChange={setTone} options={t.tones} />
              {!canGenerate ? (
                <div className="border-2 border-red-500/30 bg-red-500/5 rounded-3xl p-5 text-center">
                  <p className="text-white font-bold mb-1">{t.noMore}</p>
                  <p className="text-gray-400 text-sm mb-3">{t.noMoreSub}</p>
                  <a href="/auth" className="inline-block bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2 px-6 rounded-full text-sm">{t.upgrade}</a>
                </div>
              ) : (
                <button onClick={generateHooks} disabled={loadingHooks || !hooksState.description} className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-3xl hover:opacity-90 disabled:opacity-50 transition text-lg">
                  {loadingHooks ? t.generating : t.generateHooks}
                </button>
              )}
              <div className="border-2 border-gray-800 rounded-3xl overflow-hidden">
                <button onClick={() => setAccordionOpen((o) => !o)} className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-gray-900 transition">
                  <span className="text-sm font-bold text-gray-300">{t.whatIsHook}</span>
                  <span className={`text-gray-400 transition-transform ${accordionOpen ? "rotate-180" : ""}`}>▾</span>
                </button>
                {accordionOpen && (
                  <div className="px-5 pb-5 space-y-3 text-sm text-gray-400 border-t-2 border-gray-800 pt-4">
                    <p>{t.hookExplain1}</p><p>{t.hookExplain2}</p><p>{t.hookExplain3}</p>
                    <div className="border-2 border-gray-800 rounded-2xl p-3 mt-2">
                      <p className="text-xs text-gray-600 uppercase font-black tracking-widest mb-2">{t.example}</p>
                      <p className="text-white italic">"{t.hookExample}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <TinderCard hooks={hooks} onLike={(h) => setHooksState(s => ({ ...s, liked: [...s.liked, h] }))} liked={hooksState.liked} t={t} user={user} platform={platform} tone={tone} langue={langue} />
              <button onClick={() => setHooksState(s => ({ ...s, result: "" }))} className="w-full border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 py-3 rounded-3xl transition text-sm font-medium">{t.restart}</button>
            </div>
          )
        )}
        {tab === "legende" && <LegendeTab platform={platform} langue={langue} t={t} user={user} state={legendeState} setState={setLegendeState} />}
        {tab === "idees" && <IdeesTab platform={platform} langue={langue} t={t} user={user} state={ideesState} setState={setIdeesState} />}
        {tab === "analyse" && <AnalyseTab platform={platform} langue={langue} t={t} state={analyseState} setState={setAnalyseState} />}
        {tab === "saved" && <SavedTab user={user} t={t} />}
      </div>
    </main>
  );
}