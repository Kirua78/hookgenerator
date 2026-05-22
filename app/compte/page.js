'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function StatBox({ label, userId, table, icon }) {
  const [count, setCount] = useState('...');
  useEffect(() => {
    if (!userId) return;
    supabase.from(table).select('id', { count: 'exact' }).eq('user_id', userId)
      .then(({ count }) => setCount(count || 0));
  }, [userId, table]);
  return (
    <div className="border-2 border-gray-800 rounded-2xl p-4 text-center bg-black/40">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-black text-white">{count}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function Compte() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ prenom: '', nom: '', surnom: '' });
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) { window.location.href = '/auth'; return; }
        setUser(session.user);
        setEditForm({
          prenom: session.user.user_metadata?.prenom || '',
          nom: session.user.user_metadata?.nom || '',
          surnom: session.user.user_metadata?.surnom || '',
        });
        const { data } = await supabase.from('user_profiles').select('*').eq('id', session.user.id).single();
        setProfile(data || {});
        setLoading(false);
      } catch (e) {
        window.location.href = '/auth';
      }
    };
    fetchData();
  }, []);

  const handleSaveProfil = async () => {
    setSaving(true); setSaveMsg('');
    const { error } = await supabase.auth.updateUser({ data: { prenom: editForm.prenom, nom: editForm.nom, surnom: editForm.surnom } });
    if (error) setSaveMsg('Erreur lors de la sauvegarde.');
    else {
      setSaveMsg('✅ Profil mis à jour !');
      setUser(prev => ({ ...prev, user_metadata: { ...prev.user_metadata, ...editForm } }));
      setEditing(false);
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/'; };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    await supabase.from('liked_hooks').delete().eq('user_id', user.id);
    await supabase.from('liked_idees').delete().eq('user_id', user.id);
    await supabase.from('liked_legendes').delete().eq('user_id', user.id);
    await supabase.from('user_profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getBadge = (plan) => {
    switch(plan) {
      case 'annuel': return { label: '🥇 Pro Creator Or', color: 'from-yellow-500 to-yellow-300' };
      case 'mensuel': return { label: '🥈 Pro Creator Argent', color: 'from-gray-400 to-gray-300' };
      case 'pack200':
      case 'pack500': return { label: '🥉 Pro Creator Bronze', color: 'from-orange-700 to-orange-500' };
      default: return null;
    }
  };

  const getPlanLabel = (plan) => {
    switch(plan) {
      case 'annuel': return 'Premium Annuel';
      case 'mensuel': return 'Premium Mensuel';
      case 'pack200': return 'Pack 200 Hooks';
      case 'pack500': return 'Pack 500 Hooks';
      default: return 'Gratuit';
    }
  };

  const getPlanDesc = (plan) => {
    switch(plan) {
      case 'annuel': return '39,99€/an · Générations illimitées';
      case 'mensuel': return '4,99€/mois · Générations illimitées';
      case 'pack200': return 'One-shot · 200 hooks';
      case 'pack500': return 'One-shot · 500 hooks';
      default: return '3 générations/jour · Accès aux 4 outils';
    }
  };

  if (loading) return (
    <main className="min-h-screen text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-500">Chargement...</p>
      </div>
    </main>
  );

  const badge = getBadge(profile?.plan);
  const metadata = user?.user_metadata || {};

  return (
    <main className="min-h-screen text-white p-6 pb-24">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <a href="/app" className="text-xs text-gray-500 hover:text-pink-400 transition flex items-center gap-1">← App</a>
          <button onClick={handleLogout} className="text-xs border-2 border-gray-800 hover:border-pink-500 text-gray-400 hover:text-pink-400 px-3 py-1.5 rounded-full transition">
            Déconnexion
          </button>
        </div>

        {/* Avatar + nom */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 shadow-lg shadow-pink-500/20">
            {metadata.prenom ? metadata.prenom[0].toUpperCase() : '?'}
          </div>
          <h1 className="text-2xl font-black text-white">
            {metadata.prenom || ''} {metadata.nom || ''}
          </h1>
          {metadata.surnom && <p className="text-gray-500 text-sm mt-1">{metadata.surnom}</p>}
          <p className="text-gray-600 text-xs mt-1">{user?.email}</p>
          {badge && (
            <div className={`inline-flex items-center mt-3 bg-gradient-to-r ${badge.color} text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg`}>
              {badge.label}
            </div>
          )}
        </div>

        {/* Plan */}
        <div className="border-2 border-gray-800 bg-black/40 rounded-3xl p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-2">Mon Plan</p>
              <p className="text-white font-black text-lg">{getPlanLabel(profile?.plan)}</p>
              <p className="text-gray-500 text-xs mt-1">{getPlanDesc(profile?.plan)}</p>
              {profile?.subscription_end && (
                <p className="text-xs text-gray-600 mt-1">
                  Valable jusqu'au {new Date(profile.subscription_end).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            {!profile?.plan || profile?.plan === 'free' ? (
              <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1.5 rounded-full">Gratuit</span>
            ) : (
              <span className="text-xs bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30 text-pink-400 px-3 py-1.5 rounded-full">Premium</span>
            )}
          </div>

          {(profile?.plan === 'pack200' || profile?.plan === 'pack500') && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{profile?.hooks_remaining || 0} hooks restants</span>
                <span>{profile?.plan === 'pack200' ? '200' : '500'} total</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-pink-500 to-violet-500 h-2 rounded-full transition-all"
                  style={{ width: `${((profile?.hooks_remaining || 0) / (profile?.plan === 'pack200' ? 200 : 500)) * 100}%` }} />
              </div>
            </div>
          )}

          <a href="/pricing" className="block w-full text-center bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-pink-500/30 hover:border-pink-500 text-pink-400 hover:text-pink-300 py-3 rounded-2xl transition text-sm font-bold">
            {!profile?.plan || profile?.plan === 'free' ? '⭐ Passer au Premium' : '🔄 Changer de plan'}
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatBox label="Hooks" userId={user?.id} table="liked_hooks" icon="❤️" />
          <StatBox label="Idées" userId={user?.id} table="liked_idees" icon="💡" />
          <StatBox label="Légendes" userId={user?.id} table="liked_legendes" icon="✍️" />
        </div>

        {/* Profil */}
        <div className="border-2 border-gray-800 bg-black/40 rounded-3xl p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-black tracking-widest uppercase text-pink-400">Informations</p>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-xs border-2 border-gray-700 hover:border-pink-500 text-gray-400 hover:text-pink-400 px-3 py-1 rounded-full transition">
                ✏️ Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setSaveMsg(''); }} className="text-xs border-2 border-gray-700 text-gray-400 px-3 py-1 rounded-full hover:border-gray-500 transition">Annuler</button>
                <button onClick={handleSaveProfil} disabled={saving} className="text-xs bg-gradient-to-r from-pink-500 to-violet-500 text-white px-3 py-1 rounded-full disabled:opacity-50">
                  {saving ? '⏳' : '✅ Sauvegarder'}
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Prénom</p>
                  <p className="text-white text-sm font-medium">{metadata.prenom || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Nom</p>
                  <p className="text-white text-sm font-medium">{metadata.nom || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Surnom</p>
                <p className="text-white text-sm font-medium">{metadata.surnom || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Email</p>
                <p className="text-white text-sm font-medium">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Prénom</p>
                  <input type="text" value={editForm.prenom} onChange={(e) => setEditForm(f => ({ ...f, prenom: e.target.value }))}
                    className="w-full bg-transparent border-2 border-gray-700 focus:border-pink-500 rounded-2xl px-4 py-2 text-white text-sm focus:outline-none transition" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Nom</p>
                  <input type="text" value={editForm.nom} onChange={(e) => setEditForm(f => ({ ...f, nom: e.target.value }))}
                    className="w-full bg-transparent border-2 border-gray-700 focus:border-pink-500 rounded-2xl px-4 py-2 text-white text-sm focus:outline-none transition" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Surnom</p>
                <input type="text" value={editForm.surnom} onChange={(e) => setEditForm(f => ({ ...f, surnom: e.target.value }))}
                  className="w-full bg-transparent border-2 border-gray-700 focus:border-pink-500 rounded-2xl px-4 py-2 text-white text-sm focus:outline-none transition" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Email</p>
                <p className="text-white text-sm font-medium">{user?.email}</p>
              </div>
              {saveMsg && <p className="text-sm text-center text-green-400">{saveMsg}</p>}
            </div>
          )}
        </div>

        {/* Liens utiles */}
        <div className="border-2 border-gray-800 bg-black/40 rounded-3xl p-6 mb-4">
          <p className="text-xs font-black tracking-widest uppercase text-pink-400 mb-4">Liens utiles</p>
          <div className="space-y-1">
            {[
              { href: '/cgu', label: 'Conditions Générales d\'Utilisation' },
              { href: '/privacy', label: 'Politique de Confidentialité' },
              { href: 'mailto:contact@hookgenerator.eu', label: 'Contacter le support' },
            ].map((link) => (
              <a key={link.href} href={link.href} className="flex justify-between items-center text-sm text-gray-400 hover:text-white transition py-2 border-b border-gray-800 last:border-0">
                <span>{link.label}</span><span className="text-gray-600">→</span>
              </a>
            ))}
          </div>
        </div>

        {/* Supprimer le compte */}
        <div className="text-center">
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)} className="text-xs text-gray-700 hover:text-red-400 transition">
              Supprimer mon compte
            </button>
          ) : (
            <div className="border-2 border-red-500/20 bg-red-500/5 rounded-3xl p-6 space-y-3">
              <p className="text-sm text-red-300 font-medium">Cette action est irréversible.</p>
              <p className="text-xs text-gray-500">Toutes tes données seront définitivement supprimées.</p>
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