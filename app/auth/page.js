'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [surnom, setSurnom] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [message, setMessage] = useState('');

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://hookgenerator.eu/app' },
    });
    if (error) { setMessage(error.message); setLoadingGoogle(false); }
  };

  const handle = async () => {
    setLoading(true); setMessage('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/app';
    } else {
      if (!prenom || !nom || !surnom) { setMessage('Merci de remplir tous les champs.'); setLoading(false); return; }
      if (password !== confirmPassword) { setMessage('Les mots de passe ne correspondent pas.'); setLoading(false); return; }
      if (password.length < 6) { setMessage('Le mot de passe doit contenir au moins 6 caractères.'); setLoading(false); return; }
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { prenom, nom, surnom } } });
      if (error) {
        setMessage(error.message);
      } else {
        if (data?.user) {
          await supabase.from('user_profiles').upsert({ id: data.user.id, is_premium: false, plan: 'free' });
          await fetch('/api/send-welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, prenom }) });
        }
        setMessage('Vérifie ton email pour confirmer ton compte !');
      }
    }
    setLoading(false);
  };

  const switchMode = () => { setIsLogin(!isLogin); setMessage(''); setPrenom(''); setNom(''); setSurnom(''); setPassword(''); setConfirmPassword(''); };

  return (
    <main className="min-h-screen text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <img src="/logo.png" alt="HookGenerator" className="h-24 mx-auto mb-4 object-contain" />
        <p className="text-gray-400 text-center mb-8">{isLogin ? 'Connexion' : 'Créer un compte'}</p>

        {/* Bouton Google */}
        <button
          onClick={handleGoogle}
          disabled={loadingGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 rounded-3xl transition disabled:opacity-50 mb-3"
        >
          {loadingGoogle ? '⏳...' : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </>
          )}
        </button>

        {/* Séparateur */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-xs text-gray-600">ou</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                  className="w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition" />
                <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)}
                  className="w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition" />
              </div>
              <input type="text" placeholder="Surnom (ex: @tonpseudo)" value={surnom} onChange={(e) => setSurnom(e.target.value)}
                className="w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition" />
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition" />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition" />
          {!isLogin && (
            <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition" />
          )}
          {message && (
            <p className={`text-sm text-center ${message.includes('Vérifie') ? 'text-green-400' : 'text-pink-400'}`}>{message}</p>
          )}
          <button onClick={handle} disabled={loading || !email || !password}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-3xl hover:opacity-90 disabled:opacity-50 transition">
            {loading ? '⏳...' : isLogin ? 'Se connecter' : 'Créer mon compte'}
          </button>
          <button onClick={switchMode} className="w-full text-gray-400 hover:text-white text-sm transition">
            {isLogin ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </main>
  );
}