
import React, { useState } from 'react';
import { LOGO } from '../constants';
import { supabase } from '../supabase';

const LoginPage: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email Verification Required: In your Supabase Dashboard, go to Authentication -> Providers -> Email and toggle OFF "Confirm email" for instant access.');
        } else if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
      } else {
        // Success - we let the App.tsx state listener take over, 
        // but we reset local loading just in case the redirect is slow
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col justify-center max-w-md mx-auto">
      <div className="mb-12 flex flex-col items-center">{LOGO}</div>
      <div className="space-y-2 mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
        <p className="text-slate-400 font-medium">Securely access your communal fund.</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-500 p-5 rounded-3xl text-xs font-bold mb-6 border border-rose-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <i className="fa-solid fa-circle-exclamation mt-0.5 text-rose-600"></i> 
          <span className="leading-relaxed">
            {error}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
            placeholder="admin@funters.com"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
          <input 
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
            placeholder="••••••••"
          />
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 mt-2"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Authenticating...</span>
            </div>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400 font-medium">
          New here? <button onClick={onToggle} className="text-indigo-600 font-black hover:underline">Create Account</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
