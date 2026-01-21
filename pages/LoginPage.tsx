
import React, { useState } from 'react';
import { LOGO } from '../constants';
import { supabase } from '../supabase';

const LoginPage: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Supabase Passwordless Magic Link Login
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-white p-8 flex flex-col justify-center items-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6 border border-indigo-100 animate-pulse">
          <i className="fa-solid fa-paper-plane text-3xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Check Your Email</h2>
        <p className="text-slate-500 mb-8 font-medium">
          We've sent a magic login link to <b>{email}</b>. Click the link to access Funters Fund.
        </p>
        <button onClick={() => setSent(false)} className="text-indigo-600 font-black text-sm uppercase tracking-widest">Didn't get it? Try again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col justify-center max-w-md mx-auto">
      <div className="mb-12 flex flex-col items-center">{LOGO}</div>
      <div className="space-y-2 mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-800">Fast Login</h2>
        <p className="text-slate-400 font-medium">No password needed. Just your email.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100 flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation"></i> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Member Email</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            placeholder="yourname@example.com"
          />
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Sending Link...' : 'Send Magic Link'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400 font-medium">
          First time here? <button onClick={onToggle} className="text-indigo-600 font-black">Request Membership</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
