
import React, { useState } from 'react';
import { UserRole } from '../types';
import { LOGO } from '../constants';
import { supabase } from '../supabase';

const SignupPage: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    setError('');

    const { error: signUpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: name,
          role: role,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSubmitted(true);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white p-8 flex flex-col justify-center items-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
          <i className="fa-solid fa-envelope-circle-check text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Verify Identity</h2>
        <p className="text-slate-500 mb-8 font-medium">
          We've sent a link to <b>{email}</b>.<br/>Confirm your email to activate your {role === UserRole.ADMIN ? 'Manager' : 'Member'} request.
        </p>
        <button onClick={onToggle} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200">Return to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col justify-center max-w-md mx-auto">
       <div className="mb-12 flex flex-col items-center">{LOGO}</div>
      <div className="space-y-2 mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-800">Join the Circle</h2>
        <p className="text-slate-400 font-medium">Emergency assistance for verified friends.</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-xs font-bold mb-6 border border-rose-100 flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Your Full Name</label>
          <input 
            type="text" required value={name} onChange={e => setName(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" 
            placeholder="e.g. Abubakar S." 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" 
            placeholder="name@example.com" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Type</label>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => setRole(UserRole.MEMBER)} 
              className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${role === UserRole.MEMBER ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
            >
              Member
            </button>
            <button 
              type="button" 
              onClick={() => setRole(UserRole.ADMIN)} 
              className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${role === UserRole.ADMIN ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
            >
              Manager
            </button>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            {role === UserRole.MEMBER ? (
              <p className="text-[10px] text-slate-500 leading-relaxed">
                <i className="fa-solid fa-circle-info text-indigo-400 mr-1"></i>
                <b>Members</b> can log contributions and request emergency loans. Requires manager approval after email verification.
              </p>
            ) : (
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider leading-relaxed">
                <i className="fa-solid fa-shield-halved mr-1"></i>
                <b>Managers</b> have instant access to audits, approvals, and loan management tools.
              </p>
            )}
          </div>
        </div>
        <button 
          disabled={loading} 
          type="submit" 
          className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-spinner animate-spin"></i> Processing Request...
            </span>
          ) : 'Request Access'}
        </button>
      </form>
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400 font-medium">
          Already verified? <button onClick={onToggle} className="text-indigo-600 font-black hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
