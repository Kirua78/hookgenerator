'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Compte() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/auth'; return; }
      setUser(session.user);
      const { data } = await supabase.from('user_profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleDelete = async () => {
    setDeleting(true);
    // Supprimer les données utilisateur
    await supabase.from('liked_hooks').delete().eq('user_id', user.id);
    await supabase.from('liked_idees').delete().eq('user_id', user.id);
    await supabase.from('liked_legendes').delete().eq('user_id', user.id);
    await supabase.from('user_profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getBadge = (plan) => {
    switch(plan) {
      case 'annuel': return { label: '🥇 Pro Creator', color: 'from-yellow-500 to-yellow-300', text: 'Or' };
      case 'mensuel': return { label: '🥈 Pro Creator', color: 'from-gray-400 to-gray-300', text: 'Argent' };
      case 'pack200':
      case 'pack500': return { label: '🥉 Pro Creator', color: 'from-orange-700 to-orange-500', text: 'Bronze' };
      default: return null;
    }
  };

  const getPlanLabel = (plan) => {
    switch(plan) {
      case 'annuel': return 'Premium Annuel — 39,99€/an';
      case 'mensuel': return 'Premium Mensuel — 4,99€/mois';
      case 'pack200': return 'Pack 200 Hooks';
      case 'pack500': return 'Pack 500 Hooks';
      default: return 'Gratuit';
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-500">⏳ Chargement...</p>
    </main>
  );

  const badge = getBadge(profile?.plan);
  const metadata = user?.user_metadata || {};

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <a href="/" className="text-xs text-gray-500 hover:text-pink-400 transition">← Retour</a>
          <button onClick={handleLogout} className="text-xs border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 px-3 py-1.5 rounded-full transition">Déconnexion</button>
        </div>

        <h1 className="text-3xl font-black mb-8 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Mon Compte</h1>

        {/* Profil */}
        <div className="border-2 border-gray-800 rounded-3xl p-6 mb-4 space-y-4">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400">Profil</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Prénom</p>
              <p className="text-white font-medium">{metadata.prenom || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Nom</p>
              <p className="text-white font-medium">{metadata.nom || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Surnom</p>
            <p className="text-white font-medium">{metadata.surnom || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-white font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Plan */}
        <div className="border-2 border-gray-800 rounded-3xl p-6 mb-4 space-y-4">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400">Mon Plan</p>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold">{getPlanLabel(profile?.plan)}</p>
              {profile?.subscription_end && (
                <p className="text-xs text-gray-500 mt-1">
                  Valable jusqu'au {new Date(profile.subscription_end).toLocaleDateString('fr-FR')}
                </p>
              )}
              {(profile?.plan === 'pack200' || profile?.plan === 'pack500') && (
                <p className="text-xs text-gray-500 mt-1">
                  {profile?.hooks_remaining || 0} hooks restants
                </p>
              )}
            </div>
            {badge && (
              <div className={`bg-gradient-to-r ${badge.color} text-white text-xs font-black px-3 py-1.5 rounded-full`}>
                {badge.label}
              </div>
            )}
          </div>

          {/* Barre de progression pour les packs */}
          {(profile?.plan === 'pack200' || profile?.plan === 'pack500') && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{profile?.hooks_remaining || 0} restants</span>
                <span>{profile?.plan === 'pack200' ? '200' : '500'} total</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-violet-500 h-2 rounded-full transition-all"
                  style={{ width: `${((profile?.hooks_remaining || 0) / (profile?.plan === 'pack200' ? 200 : 500)) * 100}%` }}
                />
              </div>
            </div>
          )}

          <a href="/pricing" className="block w-full text-center border-2 border-pink-500/50 hover:border-pink-500 text-pink-400 hover:text-pink-300 py-3 rounded-2xl transition text-sm font-medium">
            {profile?.plan === 'free' ? '⭐ Passer au Premium' : '🔄 Changer de plan'}
          </a>
        </div>

        {/* Stats */}
        <div className="border-2 border-gray-800 rounded-3xl p-6 mb-4">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-4">Mes Statistiques</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <StatBox label="Hooks likés" userId={user?.id} table="liked_hooks" />
            <StatBox label="Idées sauvées" userId={user?.id} table="liked_idees" />
            <StatBox label="Légendes" userId={user?.id} table="liked_legendes" />
          </div>
        </div>

        {/* Liens utiles */}
        <div className="border-2 border-gray-800 rounded-3xl p-6 mb-4 space-y-3">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400">Liens utiles</p>
          <a href="/cgu" className="flex justify-between items-center text-sm text-gray-400 hover:text-white transition py-1">
            <span>Conditions Générales d'Utilisation</span><span>→</span>
          </a>
          <a href="/privacy" className="flex justify-between items-center text-sm text-gray-400 hover:text-white transition py-1">
            <span>Politique de Confidentialité</span><span>→</span>
          </a>
          <a href="mailto:contact@hookgenerator.eu" className="flex justify-between items-center text-sm text-gray-400 hover:text-white transition py-1">
            <span>Contacter le support</span><span>→</span>
          </a>
        </div>

        {/* Danger zone */}
        <div className="border-2 border-red-500/20 bg-red-500/5 rounded-3xl p-6">
          <p className="text-xs font-black tracking-widest uppercase text-red-400 mb-3">Zone dangereuse</p>
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)} className="text-sm text-red-400 hover:text-red-300 transition">
              🗑️ Supprimer mon compte
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-300">Cette action est irréversible. Toutes tes données seront supprimées.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 border-2 border-gray-700 text-gray-400 py-2 rounded-2xl text-sm transition hover:border-gray-500">Annuler</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-2xl text-sm font-bold transition disabled:opacity-50">
                  {deleting ? '⏳...' : 'Confirmer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatBox({ label, userId, table }) {
  const [count, setCount] = useState('...');
  useEffect(() => {
    if (!userId) return;
    supabase.from(table).select('id', { count: 'exact' }).eq('user_id', userId)
      .then(({ count }) => setCount(count || 0));
  }, [userId, table]);
  return (
    <div>
      <p className="text-2xl font-black text-white">{count}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}