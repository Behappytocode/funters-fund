import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus, AppState } from './types';
import { INITIAL_DEVELOPER, LOGO } from './constants';
import { supabase, isSupabaseConfigured, configStatus } from './supabase';

// Pages
import Dashboard from './pages/Dashboard';
import DepositsPage from './pages/DepositsPage';
import LoansPage from './pages/LoansPage';
import InboxPage from './pages/InboxPage';
import DevProfile from './pages/DevProfile';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

/* -------------------- UI Helpers -------------------- */

const ConfigRow: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
    <span className="text-[10px] font-bold text-slate-500">{label}</span>
    <div className={`flex items-center gap-1.5 ${active ? 'text-emerald-500' : 'text-rose-500'}`}>
      <i className={`fa-solid ${active ? 'fa-circle-check' : 'fa-circle-xmark'} text-[10px]`} />
      <span className="text-[10px] font-black uppercase tracking-wider">
        {active ? 'Detected' : 'Missing'}
      </span>
    </div>
  </div>
);

const NavBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  count?: number;
}> = ({ active, onClick, icon, count }) => (
  <button
    onClick={onClick}
    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
      active
        ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/50'
        : 'text-slate-400 hover:text-white'
    }`}
  >
    <i className={`fa-solid ${icon} ${active ? 'text-lg' : 'text-base'}`} />
    {count && count > 0 && !active && (
      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-[8px] font-black flex items-center justify-center rounded-full text-white ring-2 ring-slate-900">
        {count}
      </span>
    )}
    {active && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}
  </button>
);

/* -------------------- App -------------------- */

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'DEPOSITS' | 'LOANS' | 'INBOX' | 'DEV'>('HOME');
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    users: [],
    deposits: [],
    loans: [],
    developerInfo: INITIAL_DEVELOPER,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await fetchUserData(data.session.user.id);
      } else {
        setLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUserData(session.user.id);
      else {
        setAppState(prev => ({ ...prev, currentUser: null }));
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!isSupabaseConfigured) return;

    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: deposits } = await supabase.from('deposits').select('*, profiles(name)');
    const { data: loans } = await supabase.from('loans').select('*, profiles(name)');

    setAppState(prev => ({
      ...prev,
      users: profiles || [],
      deposits:
        deposits?.map(d => ({
          ...d,
          memberName: (d.profiles as any)?.name || 'Unknown',
          memberId: d.member_id,
          paymentDate: d.payment_date,
          entryDate: d.created_at,
        })) || [],
      loans:
        loans?.map(l => ({
          ...l,
          memberName: (l.profiles as any)?.name || 'Unknown',
          memberId: l.member_id,
          totalAmount: l.total_amount,
          recoverableAmount: l.recoverable_amount,
          waiverAmount: l.waiver_amount,
          issueDate: l.issue_date,
          termMonths: l.term_months,
        })) || [],
    }));
  };

  const fetchUserData = async (userId: string) => {
    if (!isSupabaseConfigured) return;

    const { data: profile } = await supabase
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
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setActiveTab('HOME');
    setIsLoginView(true);
  };

  /* -------------------- Guards -------------------- */

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full">
          <h2 className="text-xl font-black mb-6 text-center">Supabase Config Missing</h2>
          <div className="space-y-3">
            <ConfigRow label="VITE_SUPABASE_URL" active={configStatus.url} />
            <ConfigRow label="VITE_SUPABASE_ANON_KEY" active={configStatus.anonKey} />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-14 w-14 rounded-full border-t-4 border-indigo-600" />
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
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm">
        {LOGO}
        <button onClick={logout}>
          <i className="fa-solid fa-right-from-bracket text-slate-400 hover:text-rose-500" />
        </button>
      </header>

      <main className="p-6 max-w-lg mx-auto">
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

      <nav className="fixed bottom-6 left-6 right-6 bg-slate-900 rounded-full p-2 flex justify-between max-w-lg mx-auto">
        <NavBtn active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} icon="fa-house" />
        <NavBtn active={activeTab === 'DEPOSITS'} onClick={() => setActiveTab('DEPOSITS')} icon="fa-sack-dollar" />
        <NavBtn active={activeTab === 'LOANS'} onClick={() => setActiveTab('LOANS')} icon="fa-handshake-angle" />
        <NavBtn
          active={activeTab === 'INBOX'}
          onClick={() => setActiveTab('INBOX')}
          icon="fa-inbox"
          count={appState.users.filter(u => u.status === UserStatus.PENDING).length}
        />
        <NavBtn active={activeTab === 'DEV'} onClick={() => setActiveTab('DEV')} icon="fa-user-gear" />
      </nav>
    </div>
  );
};

export default App;