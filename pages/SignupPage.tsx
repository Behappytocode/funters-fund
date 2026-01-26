import React, { useState } from 'react';
import { UserRole } from '../types.ts';
import { LOGO } from '../constants.tsx';
import { supabase } from '../supabase.ts';

const SignupPage: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanName,
            role: role, // THIS IS CRITICAL for the trigger
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('Database error saving new user')) {
          setError('Database Error: Please run the SQL setup script in Supabase Dashboard.');
        } else if (signUpError.message.includes('User already registered')) {
          setError('This email is already registered. Try logging in.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('This email is already taken. Please use a different one or log in.');
        setLoading(false);
      } else if (!data.user) {
        setError('Signup failed. Please try again.');
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError('A system error occurred. Please check your internet connection.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white p-8 flex flex-col justify-center items-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100 animate-in zoom-in duration-300">
          <i className="fa-solid fa-circle-check text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Account Created!</h2>
        <p className="text-slate-500 mb-8 font-medium leading-relaxed px-4">
          Welcome to the circle, <b className="text-indigo-600">{name}</b>.<br/>
          {role === UserRole.ADMIN 
            ? "Your Manager account is active. You can sign in immediately." 
            : "Your request is sent. A manager must approve you before you can access the fund."}
        </p>
        <button 
          onClick={onToggle} 
          className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col justify-center max-w-md mx-auto">
      <div className="mb-10 flex flex-col items-center">{LOGO}</div>
      <div className="space-y-2 mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Join the Circle</h2>
        <p className="text-slate-400 font-medium">Friendship that stands in crisis.</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-500 p-5 rounded-3xl text-xs font-bold mb-6 border border-rose-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <i className="fa-solid fa-triangle-exclamation mt-0.5 text-rose-600"></i> 
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
          <input 
            type="text" required value={name} onChange={e => setName(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
            placeholder="e.g. Abubakar S." 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
            placeholder="name@example.com" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
          <input 
            type="password" required value={password} onChange={e => setPassword(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
            placeholder="Min. 6 characters" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Role</label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onClick={() => setRole(UserRole.MEMBER)} 
              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${role === UserRole.MEMBER ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              Member
            </button>
            <button 
              type="button" 
              onClick={() => setRole(UserRole.ADMIN)} 
              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${role === UserRole.ADMIN ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              Manager
            </button>
          </div>
          <p className="mt-3 text-[10px] text-slate-400 px-1 italic">
            {role === UserRole.ADMIN ? 'Managers get instant access.' : 'Members require approval.'}
          </p>
        </div>
        
        <button 
          disabled={loading} 
          type="submit" 
          className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-4"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </div>
          ) : 'Sign Up'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400 font-medium">
          Already a user? <button onClick={onToggle} className="text-indigo-600 font-black hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
