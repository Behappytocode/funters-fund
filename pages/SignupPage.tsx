
import React, { useState } from 'react';
import { UserRole } from '../types';
import { LOGO } from '../constants';
import { supabase } from '../supabase';

const SignupPage: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Sign up user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Create profile in 'profiles' table
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        role,
        status: role === UserRole.ADMIN ? 'APPROVED' : 'PENDING'
      });

      if (profileError) {
        console.error("Profile Error:", profileError);
        setError("Account created but profile setup failed. Please contact support.");
        setLoading(false);
      } else {
        setSubmitted(true);
      }
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white p-8 flex flex-col justify-center items-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
          <i className="fa-solid fa-check-double text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Request Sent!</h2>
        <p className="text-slate-500 mb-8 font-medium italic">
          Important: Check your email inbox. You must click the verification link before you can log in.
        </p>
        <button onClick={onToggle} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100">Back to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col justify-center max-w-md mx-auto">
       <div className="mb-12 flex flex-col items-center">{LOGO}</div>
      <div className="space-y-2 mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-800">Join the Circle</h2>
        <p className="text-slate-400 font-medium">Friendship that stands in crisis.</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-xs font-bold mb-6 border border-rose-100 flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm" placeholder="name@example.com" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm" placeholder="Create a password" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Role</label>
          <div className="flex gap-4">
            <button type="button" onClick={() => setRole(UserRole.MEMBER)} className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all ${role === UserRole.MEMBER ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400'}`}>Member</button>
            <button type="button" onClick={() => setRole(UserRole.ADMIN)} className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all ${role === UserRole.ADMIN ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400'}`}>Manager</button>
          </div>
        </div>
        <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-spinner animate-spin"></i> Processing...
            </span>
          ) : 'Submit Request'}
        </button>
      </form>
      <div className="mt-8 text-center"><p className="text-sm text-slate-400 font-medium">Already have an account? <button onClick={onToggle} className="text-indigo-600 font-black">Sign In</button></p></div>
    </div>
  );
};

export default SignupPage;
