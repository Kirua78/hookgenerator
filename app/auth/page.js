'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Auth() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handle = async () => {
    setLoading(true); setMessage('');
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else if (!isLogin) setMessage('Verifie ton email pour confirmer ton compte !');
    else window.location.href = '/';
    setLoading(false);
  };

  return (
    <main className='min-h-screen bg-black text-white flex items-center justify-center p-6'>
      <div className='w-full max-w-sm'>
        <img src="/logo.png" alt="HookGenerator" className="h-100 mx-auto mb-2" />
        <p className='text-gray-400 text-center mb-8'>{isLogin ? 'Connexion' : 'Créer un compte'}</p>
        <div className='space-y-4'>
          <div className='relative'>
            <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}
              className='w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition' />
          </div>
          <div className='relative'>
            <input type='password' placeholder='Mot de passe' value={password} onChange={(e) => setPassword(e.target.value)}
              className='w-full bg-transparent border-2 border-gray-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition' />
          </div>
          {message && <p className='text-sm text-center text-pink-400'>{message}</p>}
          <button onClick={handle} disabled={loading || !email || !password}
            className='w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold py-4 rounded-3xl hover:opacity-90 disabled:opacity-50 transition'>
            {loading ? '⏳...' : isLogin ? 'Se connecter' : 'Créer mon compte'}
          </button>
          <button onClick={() => setIsLogin(!isLogin)} className='w-full text-gray-400 hover:text-white text-sm transition'>
            {isLogin ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </main>
  );
}