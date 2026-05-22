'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, []);

  const t = {
    title: "Choisis ton plan",
    subtitle: "Débloque tout le potentiel de HookGenerator",
    monthly: { name: "Pro Mensuel", price: "4,99€", period: "/mois", desc: "Parfait pour commencer", badge: "🥈 Pro Creator", badgeColor: "from-gray-400 to-gray-300", features: ["Générations illimitées", "Sauvegarde des hooks", "Brief IA pour chaque idée", "Top Hooks de la semaine", "Badge Pro Creator Argent"] },
    annual: { name: "Pro Annuel", price: "39,99€", period: "/an", priceMonth: "3,33€/mois", save: "Économise 33%", desc: "Le meilleur rapport qualité/prix", badge: "🥇 Pro Creator", badgeColor: "from-yellow-500 to-yellow-300", popular: true, features: ["Tout du plan mensuel", "2 mois offerts", "Badge Pro Creator Or", "Accès prioritaire aux nouvelles fonctionnalités"] },
    pack200: { name: "Pack 200 Hooks", price: "6,99€", period: "une fois", desc: "Pour tester sans engagement", badge: "🥉 Pro Creator", badgeColor: "from-orange-700 to-orange-500", features: ["200 hooks individuels", "Fonctionnalités premium incluses", "Valable jusqu'à épuisement", "Badge Pro Creator Bronze"] },
    pack500: { name: "Pack 500 Hooks", price: "9,99€", period: "une fois", desc: "Le pack créateur sérieux", badge: "🥉 Pro Creator", badgeColor: "from-orange-700 to-orange-500", features: ["500 hooks individuels", "Fonctionnalités premium incluses", "Valable jusqu'à épuisement", "Badge Pro Creator Bronze"] },
    cta: "Choisir ce plan",
    ctaLoading: "Redirection...",
    freeFeatures: ["3 générations/jour", "Accès aux 4 outils", "4 langues disponibles"],
  };

  const checkout = async (priceKey) => {
    if (!user) { window.location.href = '/auth'; return; }
    setLoading(priceKey);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/stripe-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ priceKey }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { alert('Erreur lors du paiement'); setLoading(null); }
  };

  const PlanCard = ({ planKey, plan, highlight }) => (
    <div className={`relative border-2 rounded-3xl p-6 flex flex-col gap-4 transition ${highlight ? 'border-pink-500 bg-pink-500/5' : 'border-gray-800 hover:border-gray-600'}`}>
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-black px-4 py-1 rounded-full">
          ⭐ POPULAIRE
        </div>
      )}
      {plan.save && (
        <div className="absolute -top-3 right-6 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full">
          {plan.save}
        </div>
      )}
      <div>
        <h3 className="text-white font-black text-lg">{plan.name}</h3>
        <p className="text-gray-500 text-sm mt-1">{plan.desc}</p>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-4xl font-black text-white">{plan.price}</span>
        <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
      </div>
      {plan.priceMonth && <p className="text-green-400 text-xs -mt-2">soit {plan.priceMonth}</p>}
      <div className={`inline-flex items-center gap-1 self-start bg-gradient-to-r ${plan.badgeColor} text-white text-xs font-black px-3 py-1 rounded-full`}>
        {plan.badge}
      </div>
      <ul className="space-y-2 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-green-400 shrink-0">✓</span>{f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => checkout(planKey)}
        disabled={loading === planKey}
        className={`w-full font-bold py-3 rounded-2xl transition text-sm ${highlight ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:opacity-90' : 'border-2 border-gray-700 hover:border-pink-500 text-white hover:text-pink-400'} disabled:opacity-50`}
      >
        {loading === planKey ? t.ctaLoading : t.cta}
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <a href="/" className="text-xs text-gray-500 hover:text-pink-400 transition mb-6 inline-block">← Retour</a>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">{t.title}</h1>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        <div className="border-2 border-gray-800 rounded-3xl p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-white font-black text-lg">Gratuit</h3>
              <p className="text-gray-500 text-sm">Pour découvrir HookGenerator</p>
            </div>
            <div className="text-3xl font-black text-white">0€</div>
          </div>
          <ul className="flex gap-6 mt-4 flex-wrap">
            {t.freeFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-gray-600">✓</span>{f}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <PlanCard planKey="mensuel" plan={t.monthly} />
          <PlanCard planKey="annuel" plan={t.annual} highlight />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlanCard planKey="pack200" plan={t.pack200} />
          <PlanCard planKey="pack500" plan={t.pack500} />
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          Paiement sécurisé par Stripe · Annulation à tout moment pour les abonnements
        </p>
      </div>
    </main>
  );
}