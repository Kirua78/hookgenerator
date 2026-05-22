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
  const [message, setMessage] = useState('');

  const handle = async () => {
    setLoading(true); setMessage('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = '/';
    } else {
      if (!prenom || !nom || !surnom) {
        setMessage('Merci de remplir tous les champs.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setMessage('Les mots de passe ne correspondent pas.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setMessage('Le mot de passe doit contenir au moins 6 caractères.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { prenom, nom, surnom } }
      });
      if (error) setMessage(error.message);
      else {
        if (data?.user) {
          await supabase.from('user_profiles').upsert({
            id: data.user.id,
            is_premium: false,
            plan: 'free',
          });
       setMessage('Vérifie ton email pour confirmer ton compte !');
        setMessage('Vérifie ton email pour confirmer ton compte !');
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, prenom }),
        });
      }
    }
    setLoading(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setPrenom(''); setNom(''); setSurnom('');
    setPassword(''); setConfirmPassword('');
  };

  return (
    <main className='min-h-screen bg-black text-white flex items-center justify-center p-6'>
      <div className='w-full max-w-sm'>
        <img src="/logo.png" alt="HookGenerator" className="h-24 mx-auto mb-4 object-contain" />
        <p className='text-gray-400 text-center mb-8'>{isLogin ? 'Connexion' : 'Créer un compte'}</p>
        <div className='space-y-4'>

          {!isLogin && (
            <>
              <div className='grid grid-cols-2 gap-3'>
                <input
                  type='text'
                  placeholder='Prénom'
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className='w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition'
                />
                <input
                  type='text'
                  placeholder='Nom'
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className='w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition'
                />
              </div>
              <input
                type='text'
                placeholder='Surnom (ex: @tonpseudo)'
                value={surnom}
                onChange={(e) => setSurnom(e.target.value)}
                className='w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition'
              />
            </>
          )}

          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition'
          />
          <input
            type='password'
            placeholder='Mot de passe'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition'
          />
          {!isLogin && (
            <input
              type='password'
              placeholder='Confirmer le mot de passe'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition'
            />
          )}

          {message && (
            <p className={`text-sm text-center ${message.includes('Vérifie') ? 'text-green-400' : 'text-pink-400'}`}>
              {message}
            </p>
          )}

          <button
            onClick={handle}
            disabled={loading || !email || !password}
            className='w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-3xl hover:opacity-90 disabled:opacity-50 transition'
          >
            {loading ? '⏳...' : isLogin ? 'Se connecter' : 'Créer mon compte'}
          </button>

          <button onClick={switchMode} className='w-full text-gray-400 hover:text-white text-sm transition'>
            {isLogin ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </main>
  );
}