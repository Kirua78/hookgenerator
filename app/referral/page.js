'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ReferralPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { window.location.href = '/auth'; return; }
      setUser(session.user);
      fetchProfile(session.user.id);
    });
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('referral_code, referral_count, is_premium, plan, subscription_end')
      .eq('id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  };

  const referralLink = profile?.referral_code
    ? `https://hookgenerator.eu/auth?ref=${profile.referral_code}`
    : '';

  const copy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <main className="min-h-screen text-white flex items-center justify-center">
      <p className="text-gray-500">⏳</p>
    </main>
  );

  return (
    <main className="min-h-screen text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center">
          <img src="/logo.png" alt="HookGenerator" className="h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-black text-white mb-2">Parraine tes amis 🎁</h1>
          <p className="text-gray-400 text-sm">Gagne <span className="text-pink-400 font-bold">1 mois gratuit</span> pour chaque ami qui s'inscrit avec ton lien</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-gray-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-pink-400">{profile?.referral_count || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Amis parrainés</p>
          </div>
          <div className="border-2 border-gray-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-violet-400">{profile?.referral_count || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Mois gagnés</p>
          </div>
        </div>

        {/* Lien referral */}
        <div className="border-2 border-gray-800 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400">Ton lien unique</p>
          <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
            <p className="text-white text-sm truncate">{referralLink}</p>
          </div>
          <button onClick={copy}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-3 rounded-2xl hover:opacity-90 transition">
            {copied ? '✅ Lien copié !' : '📋 Copier mon lien'}
          </button>
        </div>

        {/* Partage réseaux */}
        <div className="space-y-2">
          <p className="text-xs font-black tracking-widest uppercase text-gray-600 text-center">Partager sur</p>
          <div className="grid grid-cols-2 gap-2">
            <a href={`https://wa.me/?text=Génère%20des%20hooks%20viraux%20en%205%20secondes%20avec%20HookGenerator%20!%20${encodeURIComponent(referralLink)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border-2 border-gray-800 hover:border-green-500 text-gray-400 hover:text-green-400 py-3 rounded-2xl transition text-sm font-medium">
              <span>📱</span> WhatsApp
            </a>
            <a href={`https://twitter.com/intent/tweet?text=Je%20génère%20mes%20hooks%20TikTok%20en%205s%20avec%20HookGenerator%20!%20Essaie%20gratuitement%20→%20${encodeURIComponent(referralLink)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border-2 border-gray-800 hover:border-blue-500 text-gray-400 hover:text-blue-400 py-3 rounded-2xl transition text-sm font-medium">
              <span>𝕏</span> Twitter
            </a>
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="border-2 border-gray-800 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400">Comment ça marche</p>
          {[
            { num: '1', text: 'Copie ton lien unique' },
            { num: '2', text: 'Partage-le à tes amis créateurs' },
            { num: '3', text: 'Ils s\'inscrivent via ton lien' },
            { num: '4', text: 'Tu gagnes 1 mois gratuit par ami !' },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white text-xs font-black shrink-0">{step.num}</span>
              <p className="text-gray-300 text-sm">{step.text}</p>
            </div>
          ))}
        </div>

        <a href="/app" className="block text-center text-xs text-gray-500 hover:text-gray-300 transition">
          ← Retour à l'app
        </a>
      </div>
    </main>
  );
}