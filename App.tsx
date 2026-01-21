
import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus, AppState, Deposit, Loan } from './types';
import { INITIAL_DEVELOPER, LOGO } from './constants';
import { supabase, isSupabaseConfigured } from './supabase';

// Pages
import Dashboard from './pages/Dashboard';
import DepositsPage from './pages/DepositsPage';
import LoansPage from './pages/LoansPage';
import InboxPage from './pages/InboxPage';
import DevProfile from './pages/DevProfile';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'DEPOSITS' | 'LOANS' | 'INBOX' | 'DEV'>('HOME');
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    users: [],
    deposits: [],
    loans: [],
    developerInfo: INITIAL_DEVELOPER
  });

  // Handle Auth Session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUserData(session.user.id);
      else {
        setAppState(prev => ({ ...prev, currentUser: null }));
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch all related data from Supabase
  const fetchData = async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: deposits } = await supabase.from('deposits').select('*, profiles(name)');
      const { data: loans } = await supabase.from('loans').select('*, profiles(name)');

      setAppState(prev => ({
        ...prev,
        users: profiles || [],
        deposits: deposits?.map(d => ({...d, memberName: d.profiles?.name || 'Unknown'})) || [],
        loans: loans?.map(l => ({...l, memberName: l.profiles?.name || 'Unknown'})) || []
      }));
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchUserData = async (userId: string) => {
    if (!isSupabaseConfigured) return;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setAppState(prev => ({ ...prev, currentUser: profile }));
      await fetchData();
    }
    setLoading(false);
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setActiveTab('HOME');
    setIsLoginView(true);
  };

  // If Supabase isn't configured, show setup instructions instead of crashing
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-indigo-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-database text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Configuration Required</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            The Supabase database connection is not active. Please add the following environment variables to your <strong>Vercel Project Settings</strong>:
          </p>
          <div className="space-y-3 text-left mb-8">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <code className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">Variable 1</code>
              <code className="text-xs break-all text-slate-700">VITE_SUPABASE_URL</code>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <code className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">Variable 2</code>
              <code className="text-xs break-all text-slate-700">VITE_SUPABASE_ANON_KEY</code>
            </div>
          </div>
          <p className="text-xs text-slate-400">Restart your deployment after adding these keys.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!appState.currentUser) {
    return isLoginView ? (
      <LoginPage onToggle={() => setIsLoginView(false)} />
    ) : (
      <SignupPage onToggle={() => setIsLoginView(true)} />
    );
  }

  const isManager = appState.currentUser.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white px-4 py-3 border-b sticky top-0 z-50 flex justify-between items-center">
        {LOGO}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-100">
            <img 
              src={appState.currentUser.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(appState.currentUser.name)}&background=6366f1&color=fff`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors p-2">
            <i className="fa-solid fa-arrow-right-from-bracket text-lg"></i>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {activeTab === 'HOME' && <Dashboard appState={appState} />}
        {activeTab === 'DEPOSITS' && (
          <DepositsPage appState={appState} refresh={fetchData} isManager={isManager} />
        )}
        {activeTab === 'LOANS' && (
          <LoansPage appState={appState} setAppState={setAppState} isManager={isManager} />
        )}
        {activeTab === 'INBOX' && (
          <InboxPage appState={appState} setAppState={setAppState} isManager={isManager} />
        )}
        {activeTab === 'DEV' && (
          <DevProfile appState={appState} setAppState={setAppState} isManager={isManager} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t bottom-nav-shadow px-2 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavItem icon="fa-grip" label="HOME" active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} />
          <NavItem icon="fa-wallet" label="DEPOSITS" active={activeTab === 'DEPOSITS'} onClick={() => setActiveTab('DEPOSITS')} />
          <NavItem icon="fa-hand-holding-dollar" label="LOANS" active={activeTab === 'LOANS'} onClick={() => setActiveTab('LOANS')} />
          <NavItem 
            icon="fa-user-group" 
            label="INBOX" 
            active={activeTab === 'INBOX'} 
            onClick={() => setActiveTab('INBOX')} 
            badge={appState.users.filter(u => u.status === UserStatus.PENDING).length}
          />
          <NavItem icon="fa-code" label="DEV" active={activeTab === 'DEV'} onClick={() => setActiveTab('DEV')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void; badge?: number }> = ({ icon, label, active, onClick, badge }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 py-1 relative transition-all duration-200 ${active ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
        {badge}
      </span>
    )}
    <div className={`p-2 rounded-xl ${active ? 'bg-indigo-50' : ''}`}><i className={`fa-solid ${icon} text-lg`}></i></div>
    <span className="text-[10px] font-bold mt-0.5 tracking-tight uppercase">{label}</span>
  </button>
);

export default App;
