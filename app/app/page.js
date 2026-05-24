"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";

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

const FLAGS = { Français: "🇫🇷", English: "🇬🇧", Español: "🇪🇸", Português: "🇧🇷" };
const ALL_LANGS = ["Français", "English", "Español", "Português"];

function TranslateButton({ hook, currentLang, isPremium }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const [translations, setTranslations] = useState({});
  const [copied, setCopied] = useState(null);

  const translate = async (targetLang) => {
    if (translations[targetLang]) return;
    setLoading(targetLang);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ hook, targetLang }),
      });
      const data = await res.json();
      if (data.translated) setTranslations(t => ({ ...t, [targetLang]: data.translated }));
    } catch (e) { console.error(e); }
    setLoading(null);
  };

  const copy = (text, lang) => { navigator.clipboard.writeText(text); setCopied(lang); setTimeout(() => setCopied(null), 2000); };
  const otherLangs = ALL_LANGS.filter(l => l !== currentLang);

  if (!isPremium) return (
    <div className="mt-2">
      <a href="/pricing" className="text-xs text-gray-600 hover:text-violet-400 transition flex items-center gap-1">
        🌍 Traduire <span className="text-xs bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded-full">Premium</span>
      </a>
    </div>
  );

  return (
    <div className="mt-2">
      <button onClick={() => setOpen(o => !o)} className="text-xs text-gray-500 hover:text-violet-400 transition flex items-center gap-1">
        🌍 Traduire {open ? "▲" : "▼"}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-2 flex-wrap">
            {otherLangs.map(lang => (
              <button key={lang} onClick={() => translate(lang)} disabled={loading === lang}
                className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition ${translations[lang] ? "border-violet-500 text-violet-400 bg-violet-500/10" : "border-gray-800 text-gray-500 hover:border-violet-500 hover:text-violet-400"} disabled:opacity-50`}>
                {loading === lang ? "⏳" : FLAGS[lang]} {lang}
              </button>
            ))}
          </div>
          {otherLangs.map(lang => translations[lang] && (
            <div key={lang} className="border-2 border-violet-500/30 bg-violet-500/5 rounded-2xl p-3 flex justify-between items-start gap-2">
              <div>
                <p className="text-xs font-bold text-violet-400 mb-1">{FLAGS[lang]} {lang}</p>
                <p className="text-white text-sm">{translations[lang]}</p>
              </div>
              <button onClick={() => copy(translations[lang], lang)} className="text-gray-500 hover:text-violet-400 transition shrink-0 text-sm">
                {copied === lang ? "✅" : "📋"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function LangSelector({ langue, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const langues = [{ id: "Français", flag: "🇫🇷" }, { id: "English", flag: "🇬🇧" }, { id: "Español", flag: "🇪🇸" }, { id: "Português", flag: "🇧🇷" }];
  const current = langues.find(l => l.id === langue);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="text-xl hover:scale-110 transition-transform"
        title={current?.id}>
        {current?.flag}
      </button>
      {open && (
        <div className="absolute top-8 left-0 bg-gray-950 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-xl z-20 min-w-max">
          {langues.map(l => (
            <button key={l.id} onClick={() => { onChange(l.id); setOpen(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left transition ${langue === l.id ? "bg-pink-500/10 text-pink-400" : "text-gray-300 hover:bg-gray-800"}`}>
              <span>{l.flag}</span><span>{l.id}</span>
              {langue === l.id && <span className="ml-auto text-pink-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// DAYS et MONTHS sont maintenant dans T[langue].days et T[langue].months


const TYPE_CONFIG = {
  hook: { label: 'Hook', color: 'bg-pink-500/20 border-pink-500/40 text-pink-400', dot: 'bg-pink-500' },
  idee: { label: 'Idée', color: 'bg-violet-500/20 border-violet-500/40 text-violet-400', dot: 'bg-violet-500' },
  legende: { label: 'Légende', color: 'bg-blue-500/20 border-blue-500/40 text-blue-400', dot: 'bg-blue-500' },
  note: { label: 'Note', color: 'bg-gray-500/20 border-gray-500/40 text-gray-400', dot: 'bg-gray-500' },
};

function getWeekDates(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

function CalendarTab({ user, isPremium, savedHooks, savedIdees, savedLegendees, t }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ type: 'hook', content: '', platform: '', note: '' });
  const [saving, setSaving] = useState(false);

  const weekDates = getWeekDates(currentDate);
  const weekStart = toISO(weekDates[0]);
  const weekEnd = toISO(weekDates[6]);

  useEffect(() => {
    if (!user) return;
    fetchEvents();
  }, [user, weekStart]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`/api/calendar?start=${weekStart}&end=${weekEnd}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  };

  const openAdd = (date) => {
    setSelectedDate(toISO(date));
    setSelectedEvent(null);
    setForm({ type: 'hook', content: '', platform: '', note: '' });
    setShowModal(true);
  };

  const openEdit = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(event.date);
    setForm({ type: event.type, content: event.content, platform: event.platform || '', note: event.note || '' });
    setShowModal(true);
  };

  const saveEvent = async () => {
    if (!form.content) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ date: selectedDate, ...form }),
    });
    await fetchEvents();
    setShowModal(false);
    setSaving(false);
  };

  const deleteEvent = async (id, e) => {
    e.stopPropagation();
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/calendar?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const goToday = () => setCurrentDate(new Date());

  const getEventsForDate = (date) => events.filter(e => e.date === toISO(date));
  const isToday = (date) => toISO(date) === toISO(new Date());

  const getSavedContent = () => {
    if (form.type === 'hook') return savedHooks || [];
    if (form.type === 'idee') return savedIdees || [];
    if (form.type === 'legende') return savedLegendees || [];
    return [];
  };

  if (!user) return (
    <div className="border-2 border-gray-800 rounded-3xl p-8 text-center">
      <p className="text-4xl mb-4">📅</p>
      <p className="text-white font-bold mb-2">Calendrier éditorial</p>
      <p className="text-gray-400 text-sm mb-4">{t.calLogin || 'Connecte-toi pour planifier tes contenus'}</p>
      <a href="/auth" className="inline-block bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2 px-6 rounded-full text-sm">{t.calConnect || 'Se connecter →'}</a>
    </div>
  );

  if (!isPremium) return (
    <div className="border-2 border-gray-800 rounded-3xl p-8 text-center">
      <p className="text-4xl mb-4">📅</p>
      <p className="text-white font-bold mb-2">Calendrier éditorial</p>
      <p className="text-gray-400 text-sm mb-4">{t.calPremiumMsg || 'Planifie tes hooks, idées et légendes sur la semaine'}</p>
      <a href="/pricing" className="inline-block bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2 px-6 rounded-full text-sm">{t.calGoPremium || '⭐ Passer Premium →'}</a>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevWeek} className="border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 px-3 py-2 rounded-2xl transition text-sm">←</button>
        <div className="text-center">
          <p className="text-white font-black text-sm">
            {weekDates[0].getDate()} {(t.months || ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'])[weekDates[0].getMonth()]} — {weekDates[6].getDate()} {(t.months || ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'])[weekDates[6].getMonth()]} {weekDates[6].getFullYear()}
          </p>
          <button onClick={goToday} className="text-xs text-gray-500 hover:text-pink-400 transition mt-1">{t.today || "Aujourd'hui"}</button>
        </div>
        <button onClick={nextWeek} className="border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 px-3 py-2 rounded-2xl transition text-sm">→</button>
      </div>

      {/* Légende */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="text-xs text-gray-500">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Grille 7 jours */}
      <div className="space-y-2">
        {weekDates.map((date, i) => {
          const dayEvents = getEventsForDate(date);
          return (
            <div
              key={i}
              onClick={() => openAdd(date)}
              className={`border-2 rounded-2xl p-3 cursor-pointer transition ${isToday(date) ? 'border-pink-500/50 bg-pink-500/5' : 'border-gray-800 hover:border-gray-700'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${isToday(date) ? 'text-pink-400' : 'text-gray-500'}`}>{(t.days || ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'])[i]}</span>
                  <span className={`text-sm font-black ${isToday(date) ? 'text-white' : 'text-gray-400'}`}>{date.getDate()}</span>
                  {isToday(date) && <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">{t.today || "Aujourd'hui"}</span>}
                </div>
                <span className="text-xs text-gray-700 hover:text-gray-500">{t.addEvent || '+ Ajouter'}</span>
              </div>
              {dayEvents.length > 0 && (
                <div className="space-y-1.5">
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={(e) => openEdit(ev, e)}
                      className={`border rounded-xl px-3 py-2 text-xs flex justify-between items-start gap-2 ${TYPE_CONFIG[ev.type]?.color}`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold uppercase tracking-widest text-xs opacity-70">{TYPE_CONFIG[ev.type]?.label}</span>
                        <p className="truncate mt-0.5">{ev.content}</p>
                        {ev.platform && <p className="opacity-60 mt-0.5">{ev.platform}</p>}
                      </div>
                      <button
                        onClick={(e) => deleteEvent(ev.id, e)}
                        className="shrink-0 opacity-50 hover:opacity-100 transition text-xs"
                      >🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-gray-950 border-2 border-gray-800 rounded-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <p className="text-white font-black">
                {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition text-xl">✕</button>
            </div>

            {/* Type */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <button key={type} onClick={() => setForm(f => ({ ...f, type, content: '' }))}
                  className={`py-2 rounded-2xl text-xs font-bold border-2 transition ${form.type === type ? `${cfg.color} border-opacity-100` : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}>
                  {cfg.label}
                </button>
              ))}
            </div>

            {/* Contenu — sélecteur si hook/idée/légende */}
            {form.type !== 'note' && getSavedContent().length > 0 && (
              <div>
                <p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-2">{t.calFrom || 'Depuis tes sauvegardes'}</p>
                <div className="max-h-32 overflow-y-auto space-y-1.5">
                  {getSavedContent().slice(0, 10).map((item, i) => {
                    const text = item.hook || item.idee || item.legende || '';
                    return (
                      <div key={i} onClick={() => setForm(f => ({ ...f, content: text }))}
                        className={`border rounded-xl px-3 py-2 text-xs cursor-pointer transition ${form.content === text ? 'border-pink-500 bg-pink-500/10 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
                        {text.slice(0, 80)}{text.length > 80 ? '...' : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Texte libre */}
            <div className="relative">
              <textarea
                className="w-full bg-transparent border-2 border-gray-800 focus:border-pink-500 rounded-2xl px-4 pt-6 pb-3 text-white text-sm focus:outline-none transition resize-none h-24 peer placeholder-transparent"
                placeholder="Contenu"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                id="cal-content"
              />
              <label htmlFor="cal-content" className="absolute left-4 top-2 text-xs font-black tracking-widest uppercase text-pink-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-pink-400 transition-all pointer-events-none">
                {form.type === 'note' ? 'Ta note' : 'Contenu'}
              </label>
            </div>

            {/* Plateforme */}
            {form.type !== 'note' && (
              <select
                value={form.platform}
                onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                className="w-full bg-gray-900 border-2 border-gray-800 focus:border-pink-500 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none transition"
              >
                <option value="">{t.calPlatform || 'Plateforme (optionnel)'}</option>
                {['TikTok', 'Instagram Reels', 'YouTube Shorts', 'LinkedIn', 'Twitter / X', 'Snapchat'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}

            <button
              onClick={saveEvent}
              disabled={saving || !form.content}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? (t.calSaving || '⏳ Enregistrement...') : (t.calSave || '✅ Planifier')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


const T = {
  Français: {
    subtitle: "Génère des hooks viraux pour tes vidéos en quelques secondes ",
    tabs: ["Hooks", "Légende", "Idées", "Analyser"],
    platform: "Plateforme", tone: "Ton",
    tones: ["Divertissant", "Inspirant", "Éducatif", "Choquant", "Émotionnel", "Storytelling"],
    videoAbout: "Ta vidéo parle de quoi ?", generateHooks: " Générer mes hooks",
    generating: " Génération en cours...", generateLegende: " Générer la légende",
    generateIdees: " Générer des idées", analyzeHook: " Analyser mon hook",
    analyzing: " Analyse en cours...", whatIsHook: " C'est quoi un hook ?",
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
    strengths: "✅ Points forts", weaknesses: "❌ Points faibles", improved: " Version améliorée",
    login: "Se connecter", logout: "Déconnexion",
    limitFree: "générations gratuites restantes aujourd'hui",
    limitConnected: "générations restantes aujourd'hui",
    unlimited: " Générations illimitées",
    noMore: "Tu as atteint ta limite du jour !",
    noMoreSub: "Connecte-toi pour plus de générations", upgrade: "Se connecter →",
    savedTab: "Sauvegardés", delete: "🗑️",
    loginToSave: "Connecte-toi pour sauvegarder tes contenus !",
    savedLegendes: "Légendes sauvegardées", savedIdees: "Idées sauvegardées", savedHooksTitle: "Hooks sauvegardés",
    saveSuccess: "✅ Sauvegardé !", saveBrief: "💾 Sauvegarder le brief", saveLegende: "💾 Sauvegarder",
    premium: "⭐ Premium",
    topTab: "Top", topTitle: "Top Hooks", topWeek: "Cette semaine", topMonth: "Ce mois",
    topEmpty: "Pas encore de hooks cette période. Génère et like des hooks pour les voir apparaître !",
    calTab: "Calendrier",
    plan30Tab: "30 Jours",
    plan30Title: "Plan 30 jours",
    plan30Sub: "30 hooks + 30 idées générés pour ta niche",
    plan30Niche: "Ta niche (ex: fitness, finance...)",
    plan30Generate: "Générer mon plan 30 jours",
    plan30Generating: "Génération en cours... (30-60s)",
    plan30Export: "📅 Exporter dans le calendrier",
    plan30Exporting: "⏳ Export en cours...",
    plan30Exported: "✅ Exporté dans le calendrier !",
    plan30List: "Liste",
    plan30Grid: "Grille",
    plan30Day: "Jour",
    plan30Hook: "Hook",
    plan30Idea: "Idée",
    plan30Tone: "Ton",
    plan30Login: "Connecte-toi pour accéder au plan 30 jours",
    plan30Premium: "Génère un plan de contenu complet pour 30 jours",
    plan30GoPremium: "⭐ Passer Premium →",
    topLikes: "like",
    days: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    addEvent: "+ Ajouter",
    today: "Aujourd'hui",
    calLogin: "Connecte-toi pour planifier tes contenus",
    calConnect: "Se connecter →",
    calPremiumMsg: "Planifie tes hooks, idées et légendes sur la semaine",
    calGoPremium: "⭐ Passer Premium →",
    calSave: "✅ Planifier",
    calSaving: "⏳ Enregistrement...",
    calFrom: "Depuis tes sauvegardes",
    calPlatform: "Plateforme (optionnel)",
    monCompteLabel: "Mon compte",
  },
  English: {
    subtitle: "Generate viral hooks for your videos in seconds ",
    tabs: ["Hooks", "Caption", "Ideas", "Analyze"],
    platform: "Platform", tone: "Tone",
    tones: ["Entertaining", "Inspiring", "Educational", "Shocking", "Emotional", "Storytelling"],
    videoAbout: "What is your video about?", generateHooks: " Generate my hooks",
    generating: " Generating...", generateLegende: " Generate caption",
    generateIdees: " Generate ideas", analyzeHook: " Analyze my hook",
    analyzing: " Analyzing...", whatIsHook: "💡 What is a hook?",
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
    strengths: "✅ Strengths", weaknesses: "❌ Weaknesses", improved: " Improved version",
    login: "Login", logout: "Logout",
    limitFree: "free generations left today", limitConnected: "generations left today",
    unlimited: " Unlimited generations",
    noMore: "You have reached your daily limit!", noMoreSub: "Login for more generations",
    upgrade: "Login →",
    savedTab: "Saved", delete: "🗑️",
    loginToSave: "Login to save your content!",
    savedLegendes: "Saved captions", savedIdees: "Saved ideas", savedHooksTitle: "Saved hooks",
    saveSuccess: "✅ Saved!", saveBrief: "💾 Save brief", saveLegende: "💾 Save",
    premium: "⭐ Premium",
    topTab: "Top", topTitle: "Top Hooks", topWeek: "This week", topMonth: "This month",
    topEmpty: "No hooks yet this period. Generate and like hooks to see them here!",
    calTab: "Calendar",
    plan30Tab: "30 Days",
    plan30Title: "30-day plan",
    plan30Sub: "30 hooks + 30 ideas generated for your niche",
    plan30Niche: "Your niche (e.g: fitness, finance...)",
    plan30Generate: "Generate my 30-day plan",
    plan30Generating: "Generating... (30-60s)",
    plan30Export: "📅 Export to calendar",
    plan30Exporting: "⏳ Exporting...",
    plan30Exported: "✅ Exported to calendar!",
    plan30List: "List",
    plan30Grid: "Grid",
    plan30Day: "Day",
    plan30Hook: "Hook",
    plan30Idea: "Idea",
    plan30Tone: "Tone",
    plan30Login: "Login to access the 30-day plan",
    plan30Premium: "Generate a complete content plan for 30 days",
    plan30GoPremium: "⭐ Go Premium →",
    topLikes: "like",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    addEvent: "+ Add",
    today: "Today",
    calLogin: "Login to plan your content",
    calConnect: "Login →",
    calPremiumMsg: "Plan your hooks, ideas and captions for the week",
    calGoPremium: "⭐ Go Premium →",
    calSave: "✅ Schedule",
    calSaving: "⏳ Saving...",
    calFrom: "From your saves",
    calPlatform: "Platform (optional)",
    monCompteLabel: "My account",
  },
  Español: {
    subtitle: "Genera hooks virales para tus videos en segundos ",
    tabs: ["Hooks", "Leyenda", "Ideas", "Analizar"],
    platform: "Plataforma", tone: "Tono",
    tones: ["Entretenido", "Inspirador", "Educativo", "Impactante", "Emocional", "Storytelling"],
    videoAbout: "De que trata tu video?", generateHooks: " Generar mis hooks",
    generating: " Generando...", generateLegende: "Generar leyenda",
    generateIdees: " Generar ideas", analyzeHook: " Analizar mi hook",
    analyzing: " Analizando...", whatIsHook: "Que es un hook?",
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
    strengths: "✅ Puntos fuertes", weaknesses: "❌ Puntos debiles", improved: " Version mejorada",
    login: "Iniciar sesion", logout: "Cerrar sesion",
    limitFree: "generaciones gratuitas hoy", limitConnected: "generaciones restantes hoy",
    unlimited: " Generaciones ilimitadas",
    noMore: "Has alcanzado tu limite diario!", noMoreSub: "Inicia sesion para mas generaciones",
    upgrade: "Iniciar sesion →",
    savedTab: "Guardados", delete: "🗑️",
    loginToSave: "Inicia sesion para guardar tu contenido!",
    savedLegendes: "Leyendas guardadas", savedIdees: "Ideas guardadas", savedHooksTitle: "Hooks guardados",
    saveSuccess: "✅ Guardado!", saveBrief: " Guardar brief", saveLegende: " Guardar",
    premium: "⭐ Premium",
    topTab: "Top", topTitle: "Top Hooks", topWeek: "Esta semana", topMonth: "Este mes",
    topEmpty: "Sin hooks aún este periodo. Genera y dale like a hooks para verlos aquí!",
    calTab: "Calendario",
    plan30Tab: "30 Días",
    plan30Title: "Plan 30 días",
    plan30Sub: "30 hooks + 30 ideas generadas para tu nicho",
    plan30Niche: "Tu nicho (ej: fitness, finanzas...)",
    plan30Generate: "Generar mi plan 30 días",
    plan30Generating: "Generando... (30-60s)",
    plan30Export: "📅 Exportar al calendario",
    plan30Exporting: "⏳ Exportando...",
    plan30Exported: "✅ ¡Exportado al calendario!",
    plan30List: "Lista",
    plan30Grid: "Cuadrícula",
    plan30Day: "Día",
    plan30Hook: "Hook",
    plan30Idea: "Idea",
    plan30Tone: "Tono",
    plan30Login: "Inicia sesión para acceder al plan 30 días",
    plan30Premium: "Genera un plan de contenido completo para 30 días",
    plan30GoPremium: "⭐ Ir a Premium →",
    topLikes: "like",
    days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    addEvent: "+ Añadir",
    today: "Hoy",
    calLogin: "Inicia sesión para planificar tu contenido",
    calConnect: "Iniciar sesión →",
    calPremiumMsg: "Planifica tus hooks, ideas y leyendas de la semana",
    calGoPremium: "⭐ Ir a Premium →",
    calSave: "✅ Programar",
    calSaving: "⏳ Guardando...",
    calFrom: "Desde tus guardados",
    calPlatform: "Plataforma (opcional)",
    monCompteLabel: "Mi cuenta",
  },
  Português: {
    subtitle: "Gere hooks virais para seus videos em segundos ",
    tabs: ["Hooks", "Legenda", "Ideias", "Analisar"],
    platform: "Plataforma", tone: "Tom",
    tones: ["Divertido", "Inspirador", "Educativo", "Chocante", "Emocional", "Storytelling"],
    videoAbout: "Do que e o seu video?", generateHooks: " Gerar meus hooks",
    generating: " Gerando...", generateLegende: " Gerar legenda",
    generateIdees: " Gerar ideias", analyzeHook: " Analisar meu hook",
    analyzing: " Analisando...", whatIsHook: "O que e um hook?",
    hookExplain1: "Um hook e a introducao dos primeiros 3 segundos do seu video.",
    hookExplain2: "E a frase que faz o usuario parar de rolar e assistir seu conteudo.",
    hookExplain3: "Sem bom hook ninguem assiste. Com bom hook o algoritmo te impulsiona.",
    example: "Exemplo", hookExample: "Eu ganhava R$1500/mes. Veja como mudei tudo.",
    restart: "← Recomecar", sawAll: "Voce viu todos!", liked: "Voce curtiu", hooks: "hook",
    likedHooks: "Seus hooks curtidos", savedHooks: "Seus salvos", noSavedHooks: "Nenhum salvo ainda.",
    pass: "👎 Passar", like: "❤️ Curtir",
    swipe: "Deslize para passar · Curta para guardar", legende: "Legenda", hashtags: "Hashtags",
    copy: "📋 Copiar", copied: "✅ Copiado!", niche: "Seu nicho (ex: fitness, financas...)",
    tenIdeas: "10 ideias de videos ", pasteHook: "Cole seu hook aqui", note: "Nota",
    strengths: "✅ Pontos fortes", weaknesses: "❌ Pontos fracos", improved: " Versao melhorada",
    login: "Entrar", logout: "Sair",
    limitFree: "geracoes gratuitas restantes hoje", limitConnected: "geracoes restantes hoje",
    unlimited: " Geracoes ilimitadas",
    noMore: "Voce atingiu seu limite diario!", noMoreSub: "Entre para mais geracoes",
    upgrade: "Entrar →",
    savedTab: "Salvos", delete: "🗑️",
    loginToSave: "Entre para salvar seu conteudo!",
    savedLegendes: "Legendas salvas", savedIdees: "Ideias salvas", savedHooksTitle: "Hooks salvos",
    saveSuccess: "✅ Salvo!", saveBrief: " Salvar brief", saveLegende: " Salvar",
    premium: "⭐ Premium",
    topTab: "Top", topTitle: "Top Hooks", topWeek: "Esta semana", topMonth: "Este mês",
    topEmpty: "Sem hooks ainda neste período. Gere e curta hooks para vê-los aqui!",
    calTab: "Calendário",
    plan30Tab: "30 Dias",
    plan30Title: "Plano 30 dias",
    plan30Sub: "30 hooks + 30 ideias geradas para o seu nicho",
    plan30Niche: "Seu nicho (ex: fitness, finanças...)",
    plan30Generate: "Gerar meu plano 30 dias",
    plan30Generating: "Gerando... (30-60s)",
    plan30Export: "📅 Exportar para o calendário",
    plan30Exporting: "⏳ Exportando...",
    plan30Exported: "✅ Exportado para o calendário!",
    plan30List: "Lista",
    plan30Grid: "Grade",
    plan30Day: "Dia",
    plan30Hook: "Hook",
    plan30Idea: "Ideia",
    plan30Tone: "Tom",
    plan30Login: "Entre para acessar o plano 30 dias",
    plan30Premium: "Gere um plano de conteúdo completo para 30 dias",
    plan30GoPremium: "⭐ Ir para Premium →",
    topLikes: "like",
    days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    addEvent: "+ Adicionar",
    today: "Hoje",
    calLogin: "Entre para planejar seu conteúdo",
    calConnect: "Entrar →",
    calPremiumMsg: "Planeje seus hooks, ideias e legendas da semana",
    calGoPremium: "⭐ Ir para Premium →",
    calSave: "✅ Agendar",
    calSaving: "⏳ Salvando...",
    calFrom: "Dos seus salvos",
    calPlatform: "Plataforma (opcional)",
    monCompteLabel: "Minha conta",
    compte: "Minha conta",
    cgu: "Termos",
    confidentialite: "Privacidade",
    mentions: "Legal",
    contact: "Contato",
    accueil: "Início",
    days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    addEvent: "+ Adicionar",
    today: "Hoje",
    calLogin: "Entre para planejar seu conteúdo",
    calConnect: "Entrar →",
    calPremiumMsg: "Planeje seus hooks, ideias e legendas da semana",
    calGoPremium: "⭐ Ir para Premium →",
    calSave: "✅ Agendar",
    calSaving: "⏳ Salvando...",
    calFrom: "Dos seus salvos",
    calPlatform: "Plataforma (opcional)",
    monCompteLabel: "Minha conta",
  },
};

function PlatformSelect({ value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const categories = [
    { label: " Social", options: ["TikTok", "Instagram Reels", "Snapchat", "Facebook", "Pinterest"] },
    { label: " Pro", options: ["LinkedIn"] },
    { label: " Video", options: ["YouTube Shorts"] },
    { label: " Micro", options: ["Twitter / X"] },
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

function TinderCard({ hooks, onLike, liked, t, user, platform, tone, langue, isPremium }) {
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
  const saveHook = async (hookText) => {
    if (!user) return;
    await supabase.from("liked_hooks").insert({ user_id: user.id, hook: hookText, platform, tone, langue });
    await supabase.rpc('upsert_top_hook', { p_hook: hookText, p_platform: platform, p_tone: tone, p_langue: langue });
  };
  const hl = () => {
    if (current >= hooks.length) return;
    setDirection("right");
    const hookText = hooks[current];
    onLike(hookText);
    saveHook(hookText);
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
              <div key={i} className="border-2 border-pink-500/30 bg-pink-500/5 rounded-2xl p-4">
                <div onClick={() => copy(h)} className="flex justify-between items-center gap-3 cursor-pointer hover:border-pink-500 transition">
                  <span className="text-white text-sm">{h}</span>
                  <span className="text-gray-500 text-lg shrink-0">📋</span>
                </div>
                <TranslateButton hook={h} currentLang={langue} isPremium={isPremium} />
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
        <TranslateButton hook={hooks[current]} currentLang={langue} isPremium={isPremium} />
        <p className="text-gray-600 text-xs text-center mt-4">{t.swipe}</p>
      </div>
      <div className="flex gap-4 mt-4">
        <button onClick={hp} className="flex-1 border-2 border-gray-800 hover:border-red-400 text-gray-400 hover:text-red-400 py-4 rounded-3xl font-bold transition text-xl">{t.pass}</button>
        <button onClick={hl} className="flex-1 border-2 border-gray-800 hover:border-green-400 text-gray-400 hover:text-green-400 py-4 rounded-3xl font-bold transition text-xl">{t.like}</button>
      </div>
    </div>
  );
}

function TopHooksTab({ t }) {
  const [period, setPeriod] = useState("week");
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  useEffect(() => { fetchTopHooks(); }, [period]);
  const fetchTopHooks = async () => {
    setLoading(true);
    const now = new Date();
    const week = getWeekNumber(now);
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    let query = supabase.from("top_hooks").select("*").eq("year", year).order("likes", { ascending: false }).limit(10);
    if (period === "week") query = query.eq("week", week);
    else query = query.eq("month", month);
    const { data } = await query;
    setHooks(data || []);
    setLoading(false);
  };
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 bg-gray-900 p-1 rounded-3xl">
        {[["week", t.topWeek], ["month", t.topMonth]].map(([id, label]) => (
          <button key={id} onClick={() => setPeriod(id)} className={`py-2.5 rounded-3xl text-xs font-bold transition ${period === id ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white" : "text-gray-400 hover:text-white"}`}>{label}</button>
        ))}
      </div>
      <p className="text-xs font-black tracking-widest uppercase text-pink-400">{t.topTitle} — {period === "week" ? t.topWeek : t.topMonth}</p>
      {loading && <div className="text-center text-gray-500 py-12">⏳</div>}
      {!loading && hooks.length === 0 && (
        <div className="border-2 border-gray-800 rounded-3xl p-8 text-center">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-gray-400 text-sm">{t.topEmpty}</p>
        </div>
      )}
      {!loading && hooks.length > 0 && (
        <div className="space-y-3">
          {hooks.map((h, i) => (
            <div key={h.id} className="border-2 border-gray-800 hover:border-pink-500 rounded-2xl p-4 transition">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{medals[i] || `${i + 1}.`}</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-2">{h.hook}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      {h.platform && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{h.platform}</span>}
                      {h.tone && <span className="text-xs bg-pink-500/10 text-pink-400 px-2 py-1 rounded-full">{h.tone}</span>}
                      <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded-full">❤️ {h.likes} {t.topLikes}{h.likes > 1 ? "s" : ""}</span>
                    </div>
                    <button onClick={() => copy(h.hook, h.id)} className="text-xs text-gray-500 hover:text-pink-400 transition px-2 py-1">{copied === h.id ? "✅" : "📋"}</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
    Français: { hook: " Hook", angle: " Angle", structure: " Structure", cta: " Call to action", astuce: "💡 Astuce viralité", back: "← Retour aux idées", generating: "⏳ Génération...", copyAll: "📋 Tout copier" },
    English: { hook: " Hook", angle: " Angle", structure: " Structure", cta: " Call to action", astuce: "💡 Virality tip", back: "← Back to ideas", generating: "⏳ Generating...", copyAll: "📋 Copy all" },
    Español: { hook: " Hook", angle: " Ángulo", structure: " Estructura", cta: " Call to action", astuce: "💡 Consejo viral", back: "← Volver a ideas", generating: "⏳ Generando...", copyAll: "📋 Copiar todo" },
    Português: { hook: " Hook", angle: " Ângulo", structure: " Estrutura", cta: " Call to action", astuce: "💡 Dica viral", back: "← Voltar às ideias", generating: "⏳ Gerando...", copyAll: "📋 Copiar tudo" },
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

function SavedTab({ user, t, isPremium, langue }) {
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
        {[["hooks", `Hooks (${hooks.length})`], ["idees", `Idées (${idees.length})`], ["legendes", `Légendes (${legendes.length})`]].map(([id, label]) => (
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
              <TranslateButton hook={h.hook} currentLang={h.langue || langue} isPremium={isPremium} />
              <div className="flex justify-between items-center mt-3">
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


function Plan30Tab({ user, isPremium, platform, langue, t }) {
  const [niche, setNiche] = useState('');
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [view, setView] = useState('list');
  const [error, setError] = useState('');

  const generate = async () => {
    if (!niche) return;
    setLoading(true); setDays([]); setError(''); setExported(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/plan30', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ niche, platform, langue }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setDays(data.days || []); }
    } catch (e) { setError('Erreur de génération'); }
    setLoading(false);
  };

  const exportToCalendar = async () => {
    if (!days.length) return;
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const today = new Date();
      for (let i = 0; i < days.length; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ date: dateStr, type: 'hook', content: days[i].hook, platform, note: days[i].idea }),
        });
      }
      setExported(true);
    } catch (e) { setError('Erreur export'); }
    setExporting(false);
  };

  if (!user) return (
    <div className="border-2 border-gray-800 rounded-3xl p-8 text-center">
      <p className="text-4xl mb-4">📅</p>
      <p className="text-white font-bold mb-2">{t.plan30Title}</p>
      <p className="text-gray-400 text-sm mb-4">{t.plan30Login}</p>
      <a href="/auth" className="inline-block bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2 px-6 rounded-full text-sm">{t.login} →</a>
    </div>
  );

  if (!isPremium) return (
    <div className="border-2 border-gray-800 rounded-3xl p-8 text-center">
      <p className="text-4xl mb-4">🗓️</p>
      <p className="text-white font-bold mb-2">{t.plan30Title}</p>
      <p className="text-gray-400 text-sm mb-4">{t.plan30Premium}</p>
      <a href="/pricing" className="inline-block bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-2 px-6 rounded-full text-sm">{t.plan30GoPremium}</a>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-1">{t.plan30Title}</p>
        <p className="text-gray-400 text-xs">{t.plan30Sub}</p>
      </div>

      {!days.length && (
        <div className="space-y-4">
          <div className="relative">
            <textarea id="plan30-niche"
              className="peer w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 pt-7 pb-3 text-white placeholder-transparent focus:outline-none focus:border-pink-500 transition resize-none h-24"
              placeholder="niche" value={niche} onChange={e => setNiche(e.target.value)} />
            <label htmlFor="plan30-niche" className="absolute left-5 top-2 text-xs font-black tracking-widest uppercase text-pink-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-xs peer-focus:font-black peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-pink-400 transition-all pointer-events-none">
              {t.plan30Niche}
            </label>
          </div>
          {error && <p className="text-pink-400 text-sm text-center">{error}</p>}
          <button onClick={generate} disabled={loading || !niche}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-3xl hover:opacity-90 disabled:opacity-50 transition text-lg">
            {loading ? t.plan30Generating : t.plan30Generate}
          </button>
          {loading && <p className="text-gray-500 text-xs text-center">La génération de 30 jours peut prendre 30 à 60 secondes...</p>}
        </div>
      )}

      {days.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-1 bg-gray-900 p-1 rounded-2xl">
              {[['list', t.plan30List], ['grid', t.plan30Grid]].map(([v, label]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition ${view === v ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={exportToCalendar} disabled={exporting || exported}
              className="text-xs border-2 border-pink-500/50 hover:border-pink-500 text-pink-400 px-3 py-1.5 rounded-full transition disabled:opacity-50">
              {exported ? t.plan30Exported : exporting ? t.plan30Exporting : t.plan30Export}
            </button>
          </div>

          <button onClick={() => { setDays([]); setNiche(''); setExported(false); }}
            className="w-full border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 py-2 rounded-3xl transition text-xs">
            ← Recommencer
          </button>

          {view === 'list' && (
            <div className="space-y-3">
              {days.map((d, i) => (
                <div key={i} className="border-2 border-gray-800 hover:border-pink-500/50 rounded-2xl p-4 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">{t.plan30Day} {d.day}</span>
                    <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{d.tone}</span>
                  </div>
                  <p className="text-white text-sm font-bold mb-1">🎣 {d.hook}</p>
                  <p className="text-gray-400 text-xs">💡 {d.idea}</p>
                </div>
              ))}
            </div>
          )}

          {view === 'grid' && (
            <div className="grid grid-cols-2 gap-2">
              {days.map((d, i) => (
                <div key={i} className="border-2 border-gray-800 hover:border-pink-500/50 rounded-2xl p-3 transition">
                  <span className="text-xs font-black text-pink-400">{t.plan30Day} {d.day}</span>
                  <p className="text-white text-xs font-bold mt-1 line-clamp-2">{d.hook}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-1">{d.idea}</p>
                  <span className="text-xs text-gray-600">{d.tone}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function Sidebar({ tab, setTab, t, user, isPremium, plan, handleLogout, langue, handleLangueChange, mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleTabClick = (id) => { setTab(id); setMobileOpen(false); };

  const mainTabs = [
    { id: 'hooks', label: t.tabs[0] },
    { id: 'legende', label: t.tabs[1] },
    { id: 'idees', label: t.tabs[2] },
    { id: 'analyse', label: t.tabs[3] },
  ];

  const extraTabs = [
    { id: 'saved', label: t.savedTab },
    { id: 'top', label: t.topTab },
    { id: 'cal', label: t.calTab },
    { id: 'plan30', label: t.plan30Tab },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <div className={`flex flex-col fixed left-0 top-0 h-full z-40 bg-black/90 backdrop-blur-md border-r border-gray-800/50 transition-all duration-300
        ${collapsed ? 'md:w-10 w-52' : 'w-52'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        {!collapsed && <img src="/logo.png" alt="HookGenerator" className="h-8 object-contain" />}
        <button onClick={() => setCollapsed(c => !c)}
          className="text-gray-500 hover:text-white transition text-lg ml-auto">
          {collapsed ? '☰' : '✕'}
        </button>
      </div>

      {/* Langue */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="flex gap-1 flex-wrap">
            {[{id:'Français',flag:'🇫🇷'},{id:'English',flag:'🇬🇧'},{id:'Español',flag:'🇪🇸'},{id:'Português',flag:'🇧🇷'}].map(l => (
              <button key={l.id} onClick={() => handleLangueChange(l.id)}
                className={`text-lg transition hover:scale-110 ${langue === l.id ? 'opacity-100' : 'opacity-40'}`}>
                {l.flag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation principale */}
      <nav className={`flex-1 p-2 space-y-1 mt-2 ${collapsed ? "hidden" : ""}`}>
        {!collapsed && <p className="text-xs font-black tracking-widest uppercase text-gray-600 px-2 mb-1">Créer</p>}
        {mainTabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`w-full text-left px-3 py-2.5 rounded-2xl text-sm font-medium transition ${tab === id ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            {collapsed ? label[0] : label}
          </button>
        ))}

        <div className="pt-2">
          {!collapsed && <p className="text-xs font-black tracking-widest uppercase text-gray-600 px-2 mb-1">Gérer</p>}
          {extraTabs.map(({ id, label }) => (
            <button key={id} onClick={() => handleTabClick(id)}
              className={`w-full text-left px-3 py-2.5 rounded-2xl text-sm font-medium transition flex items-center justify-between ${tab === id ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <span>{collapsed ? label[0] : label}</span>
              {!collapsed && (id === 'cal' || id === 'plan30') && !isPremium && (
                <span className="text-xs bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full">⭐</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer user */}
      <div className={`p-2 border-t border-gray-800 space-y-1 ${collapsed ? "hidden" : ""}`}>
        {!isPremium && !collapsed && (
          <a href="/pricing" className="block w-full text-center text-xs border border-pink-500/50 text-pink-400 py-2 rounded-2xl hover:border-pink-500 transition">
            ⭐ Premium
          </a>
        )}
        {isPremium && !collapsed && (
          <div className={`text-xs text-center py-1.5 px-2 rounded-2xl font-bold bg-gradient-to-r ${plan === 'annuel' ? 'from-yellow-500 to-yellow-300' : 'from-gray-400 to-gray-300'} text-white`}>
            {plan === 'annuel' ? '🥇 Pro Creator' : plan === 'mensuel' ? '🥈 Pro Creator' : '🥉 Pro Creator'}
          </div>
        )}
        {user && (
          <>
            <a href="/compte" className="block w-full text-left px-3 py-2 rounded-2xl text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition">
              {collapsed ? '👤' : `👤 ${t.monCompteLabel || t.compte || 'Mon compte'}`}
            </a>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-2xl text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition">
              {collapsed ? '🚪' : t.logout}
            </button>
          </>
        )}
        {!user && (
          <a href="/auth" className="block w-full text-center text-xs bg-gradient-to-r from-pink-500 to-violet-500 text-white py-2 rounded-2xl hover:opacity-90 transition">
            {collapsed ? '→' : t.login}
          </a>
        )}
      </div>
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
  const [plan, setPlan] = useState('free');
  const [generationsLeft, setGenerationsLeft] = useState(null);
  const [loadingHooks, setLoadingHooks] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      else setIsPremium(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("user_profiles").select("is_premium, plan").eq("id", userId).single();
    if (data) { setIsPremium(data.is_premium === true); setPlan(data.plan || 'free'); }
  };

  useEffect(() => {
    if (isPremium) setGenerationsLeft(null);
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
    else if (!isPremium) setGenerationsLeft((g) => Math.max(0, g - 1));
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { "Content-Type": "application/json" };
    if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
    const res = await fetch("/api/generate", {
      method: "POST", headers,
      body: JSON.stringify({ description: hooksState.description, platform, tone, langue }),
    });
    const data = await res.json();
    setHooksState(s => ({ ...s, result: data.result }));
    setLoadingHooks(false);
  };

  const parseHooks = (text) => {
    if (!text) return [];
    return text.split("\n").map((line) => { const m = line.match(/^\d+[\.\)]\s*(.+)$/); if (!m) return null; return m[1].replace(/\*\*/g, "").replace(/\s*\(.*?\)/g, "").replace(/^["'"]+|["'"]+$/g, "").trim(); }).filter(Boolean);
  };

  const hooks = parseHooks(hooksState.result);
  

  return (
    <div className="min-h-screen text-white flex" style={{ position: 'relative', zIndex: 1 }}>
      {/* Sidebar desktop */}
      <Sidebar tab={tab} setTab={setTab} t={t} user={user} isPremium={isPremium} plan={plan} handleLogout={handleLogout} langue={langue} handleLangueChange={handleLangueChange} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Contenu principal */}
      <main className={`flex-1 transition-all duration-300 min-h-screen p-4 pb-32 md:pb-6 md:ml-52`}>
        <div className="max-w-3xl mx-auto">

          {/* Header mobile */}
          <div className="flex md:hidden justify-between items-center mb-4">
            <button onClick={() => setMobileOpen(true)} className="text-white text-2xl p-1">☰</button>
            <img src="/logo.png" alt="HookGenerator" className="h-8 object-contain" />
            <a href="/auth" className={`text-xs border border-gray-800 text-gray-400 px-2 py-1 rounded-full ${user ? 'hidden' : ''}`}>{t.login}</a>
            {user && <span className="text-xs text-gray-500">{isPremium ? '⭐' : ''}</span>}
          </div>

          <div className="text-center mb-6">
            <img src="/logo.png" alt="HookGenerator" className="h-20 mx-auto mb-2 object-contain md:hidden" />
            <p className="text-gray-400 mb-3 md:mt-4">{t.subtitle}</p>
            <div className={`text-xs mb-4 font-medium ${!isPremium && generationsLeft <= 1 ? "text-red-400" : "text-gray-500"}`}>
              {isPremium ? t.unlimited : (canGenerate && generationsLeft !== null ? `${generationsLeft} ${user ? t.limitConnected : t.limitFree}` : "")}
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
                      <p className="text-white italic">&ldquo;{t.hookExample}&rdquo;</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <TinderCard hooks={hooks} onLike={(h) => setHooksState(s => ({ ...s, liked: [...s.liked, h] }))} liked={hooksState.liked} t={t} user={user} platform={platform} tone={tone} langue={langue} isPremium={isPremium} />
              <button onClick={() => setHooksState(s => ({ ...s, result: "" }))} className="w-full border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 py-3 rounded-3xl transition text-sm font-medium">{t.restart}</button>
            </div>
          )
        )}
        {tab === "legende" && <LegendeTab platform={platform} langue={langue} t={t} user={user} state={legendeState} setState={setLegendeState} />}
        {tab === "idees" && <IdeesTab platform={platform} langue={langue} t={t} user={user} state={ideesState} setState={setIdeesState} />}
        {tab === "analyse" && <AnalyseTab platform={platform} langue={langue} t={t} state={analyseState} setState={setAnalyseState} />}
        {tab === "saved" && <SavedTab user={user} t={t} isPremium={isPremium} langue={langue} />}
        {tab === "top" && <TopHooksTab t={t} />}
        {tab === "cal" && <CalendarTab user={user} isPremium={isPremium} savedHooks={[]} savedIdees={[]} savedLegendees={[]} t={t} />}
        {tab === "plan30" && <Plan30Tab user={user} isPremium={isPremium} platform={platform} langue={langue} t={t} />}
      </div>

      <div className="text-center py-6 space-x-4 text-xs text-gray-600 max-w-2xl mx-auto">
        <a href="/cgu" className="hover:text-gray-400 transition">CGU</a>
        <a href="/" className="hover:text-gray-400 transition">Accueil</a>
        <a href="/privacy" className="hover:text-gray-400 transition">Confidentialité</a>
        <a href="/mentions" className="hover:text-gray-400 transition">Mentions légales</a>
        <a href="mailto:contact@hookgenerator.eu" className="hover:text-gray-400 transition">Contact</a>
      </div>

      {!isPremium && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3">
          <a href="/pricing" className="flex items-center justify-between bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-2xl px-5 py-3 shadow-2xl hover:opacity-90 transition max-w-2xl mx-auto">
            <div>
              <p className="font-black text-sm">{!user ? " Passe au Premium" : " Deviens Pro Creator"}</p>
              <p className="text-xs text-white/80">{!user ? "Générations illimitées · Sauvegarde · dès 4,99€/mois" : "Générations illimitées · Brief IA · dès 4,99€/mois"}</p>
            </div>
            <span className="text-white font-black text-lg shrink-0">→</span>
          </a>
        </div>
      )}
    </main>
    </div>
  );
}