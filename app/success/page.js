'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const messages = {
    mensuel: { title: "🥈 Bienvenue Pro Creator !", sub: "Ton abonnement mensuel est actif. Génère des hooks sans limite !", badge: "from-gray-400 to-gray-300" },
    annuel: { title: "🥇 Bienvenue Pro Creator !", sub: "Ton abonnement annuel est actif. 2 mois offerts, profites-en !", badge: "from-yellow-500 to-yellow-300" },
    pack200: { title: "🥉 Pack 200 Hooks activé !", sub: "Tu as 200 hooks disponibles. Utilise-les quand tu veux !", badge: "from-orange-700 to-orange-500" },
    pack500: { title: "🥉 Pack 500 Hooks activé !", sub: "Tu as 500 hooks disponibles. Crée du contenu en masse !", badge: "from-orange-700 to-orange-500" },
  };

  const m = messages[plan] || { title: "🎉 Paiement réussi !", sub: "Ton compte a été mis à jour.", badge: "from-pink-500 to-violet-500" };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">{m.title}</h1>
        <p className="text-gray-400 mb-6">{m.sub}</p>
        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${m.badge} text-white font-black px-4 py-2 rounded-full mb-8`}>
          Pro Creator
        </div>
        <div>
          <a href="/" className="block w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-3xl hover:opacity-90 transition">
            Commencer à générer →
          </a>
        </div>
      </div>
    </main>
  );
}

export default function Success() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">⏳</div>}>
      <SuccessContent />
    </Suspense>
  );
}