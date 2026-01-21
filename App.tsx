
import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus, AppState } from './types.ts';
import { INITIAL_DEVELOPER, LOGO } from './constants.tsx';
import { supabase, isSupabaseConfigured } from './supabase.ts';

// Pages
import Dashboard from './pages/Dashboard.tsx';
import DepositsPage from './pages/DepositsPage.tsx';
import LoansPage from './pages/LoansPage.tsx';
import InboxPage from './pages/InboxPage.tsx';
import DevProfile from './pages/DevProfile.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';

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

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchUserData(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setAppState(prev => ({ ...prev, currentUser: null }));
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
      console.error("Data fetch error:", err);
    }
  };

  const fetchUserData = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setAppState(prev => ({ ...prev, currentUser: profile }));
        await fetchData();
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setActiveTab('HOME');
    setIsLoginView(true);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full border border-indigo-100">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <i className="fa-solid fa-cloud-bolt text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Syncing Required</h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">
            The app is deployed but cannot find your Supabase keys. Please ensure your environment variables in Vercel are exactly:
          </p>
          <div className="space-y-3 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center group">
              <code className="text-xs font-bold text-indigo-600">VITE_SUPABASE_URL</code>
              <i className="fa-solid fa-circle-check text-slate-200 group-hover:text-emerald-400 transition-colors"></i>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center group">
              <code className="text-xs font-bold text-indigo-600">VITE_SUPABASE_ANON_KEY</code>
              <i className="fa-solid fa-circle-check text-slate-200 group-hover:text-emerald-400 transition-colors"></i>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Try Redeploying after adding keys
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-handshake text-indigo-600"></i>
          </div>
        </div>
        <p className="mt-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Connecting to Circle</p>
      </div>
    );
  }

  if (!appState.currentUser) {
    return isLoginView ? <LoginPage onToggle={() => setIsLoginView(false)} /> : <SignupPage onToggle={() => setIsLoginView(true)} />;
  }

  const isManager = appState.currentUser.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white px-4 py-3 border-b sticky top-0 z-50 flex justify-between items-center">
        {LOGO}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-100">
            <img src={appState.currentUser.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(appState.currentUser.name)}&background=6366f1&color=fff`} alt="Profile" className="w-full h-full object-cover"/>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors p-2"><i className="fa-solid fa-arrow-right-from-bracket text-lg"></i></button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {activeTab === 'HOME' && <Dashboard appState={appState} />}
        {activeTab === 'DEPOSITS' && <DepositsPage appState={appState} refresh={fetchData} isManager={isManager} />}
        {activeTab === 'LOANS' && <LoansPage appState={appState} setAppState={setAppState} isManager={isManager} />}
        {activeTab === 'INBOX' && <InboxPage appState={appState} setAppState={setAppState} isManager={isManager} />}
        {activeTab === 'DEV' && <DevProfile appState={appState} setAppState={setAppState} isManager={isManager} />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t bottom-nav-shadow px-2 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavItem icon="fa-grip" label="HOME" active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} />
          <NavItem icon="fa-wallet" label="DEPOSITS" active={activeTab === 'DEPOSITS'} onClick={() => setActiveTab('DEPOSITS')} />
          <NavItem icon="fa-hand-holding-dollar" label="LOANS" active={activeTab === 'LOANS'} onClick={() => setActiveTab('LOANS')} />
          <NavItem icon="fa-user-group" label="INBOX" active={activeTab === 'INBOX'} onClick={() => setActiveTab('INBOX')} badge={appState.users.filter(u => u.status === UserStatus.PENDING).length} />
          <NavItem icon="fa-code" label="DEV" active={activeTab === 'DEV'} onClick={() => setActiveTab('DEV')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void; badge?: number }> = ({ icon, label, active, onClick, badge }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 py-1 relative transition-all duration-200 ${active ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
    {badge !== undefined && badge > 0 && <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">{badge}</span>}
    <div className={`p-2 rounded-xl ${active ? 'bg-indigo-50' : ''}`}><i className={`fa-solid ${icon} text-lg`}></i></div>
    <span className="text-[10px] font-bold mt-0.5 tracking-tight uppercase">{label}</span>
  </button>
);

export default App;
