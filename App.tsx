
import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus, AppState } from './types.ts';
import { INITIAL_DEVELOPER, LOGO } from './constants.tsx';
import { supabase, isSupabaseConfigured, configStatus } from './supabase.ts';

// Pages
import Dashboard from './pages/Dashboard.tsx';
import DepositsPage from './pages/DepositsPage.tsx';
import LoansPage from './pages/LoansPage.tsx';
import InboxPage from './pages/InboxPage.tsx';
import DevProfile from './pages/DevProfile.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';

const ConfigRow: React.FC<{ label: string, active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
    <span className="text-[10px] font-bold text-slate-500">{label}</span>
    <div className={`flex items-center gap-1.5 ${active ? 'text-emerald-500' : 'text-rose-500'}`}>
      <i className={`fa-solid ${active ? 'fa-circle-check' : 'fa-circle-xmark'} text-[10px]`}></i>
      <span className="text-[10px] font-black uppercase tracking-wider">{active ? 'Detected' : 'Missing'}</span>
    </div>
  </div>
);

const NavBtn: React.FC<{ active: boolean, onClick: () => void, icon: string, count?: number }> = ({ active, onClick, icon, count }) => (
  <button 
    onClick={onClick}
    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/50' : 'text-slate-400 hover:text-white'}`}
  >
    <i className={`fa-solid ${icon} ${active ? 'text-lg' : 'text-base'}`}></i>
    {count && count > 0 && !active && (
      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-[8px] font-black flex items-center justify-center rounded-full text-white ring-2 ring-slate-900">
        {count}
      </span>
    )}
    {active && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>}
  </button>
);

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

  const logout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setActiveTab('HOME');
    setIsLoginView(true);
  };

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
      const { data: depositsData } = await supabase.from('deposits').select(`*, profiles(name)`);
      const { data: loansData } = await supabase.from('loans').select(`*, profiles(name)`);

      setAppState(prev => ({
        ...prev,
        users: (profiles as User[]) || [],
        deposits: depositsData?.map(d => ({
          id: d.id,
          memberId: d.member_id,
          memberName: d.profiles?.name || 'Unknown',
          amount: d.amount,
          paymentDate: d.payment_date,
          entryDate: d.created_at,
          notes: d.notes
        })) || [],
        loans: loansData?.map(l => ({
          id: l.id,
          memberId: l.member_id,
          memberName: l.profiles?.name || 'Unknown',
          totalAmount: l.total_amount,
          recoverableAmount: l.recoverable_amount,
          waiverAmount: l.waiver_amount,
          issueDate: l.issue_date,
          termMonths: l.term_months,
          status: l.status,
          installments: l.installments || []
        })) || []
      }));
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  };

  const fetchUserData = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        setAppState(prev => ({ ...prev, currentUser: profile as User }));
        await fetchData();
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full border border-indigo-100 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <i className="fa-solid fa-cloud-bolt text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Syncing Required</h2>
          <div className="space-y-3 mb-8">
            <ConfigRow label="VITE_SUPABASE_URL" active={configStatus.url} />
            <ConfigRow label="VITE_SUPABASE_ANON_KEY" active={configStatus.key} />
          </div>
          <button onClick={() => window.location.reload()} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Check Again</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-6 text-xs font-black text-slate-400 uppercase tracking-widest">Opening Vault...</p>
      </div>
    );
  }

  if (!appState.currentUser) {
    return isLoginView ? <LoginPage onToggle={() => setIsLoginView(false)} /> : <SignupPage onToggle={() => setIsLoginView(true)} />;
  }

  // Handle "PENDING" members who have signed up but aren't approved yet
  if (appState.currentUser.status === UserStatus.PENDING) {
    return (
      <div className="min-h-screen bg-white p-8 flex flex-col justify-center items-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 border border-amber-100">
          <i className="fa-solid fa-hourglass-start text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Request Pending</h2>
        <p className="text-slate-500 mb-8 font-medium">
          Welcome, {appState.currentUser.name}! Your membership request is currently being reviewed by a Fund Manager. Please check back later.
        </p>
        <button onClick={logout} className="w-full bg-slate-100 text-slate-600 font-black py-5 rounded-2xl border border-slate-200">Sign Out</button>
      </div>
    );
  }

  const isManager = appState.currentUser.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        {LOGO}
        <button onClick={logout} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </header>

      <main className="p-6 max-w-lg mx-auto">
        {activeTab === 'HOME' && <Dashboard appState={appState} />}
        {activeTab === 'DEPOSITS' && <DepositsPage appState={appState} refresh={fetchData} isManager={isManager} />}
        {activeTab === 'LOANS' && <LoansPage appState={appState} setAppState={setAppState} isManager={isManager} />}
        {activeTab === 'INBOX' && <InboxPage appState={appState} setAppState={setAppState} isManager={isManager} />}
        {activeTab === 'DEV' && <DevProfile appState={appState} setAppState={setAppState} isManager={isManager} />}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-lg rounded-[2.5rem] p-2 flex justify-between items-center shadow-2xl z-50 border border-white/10 max-w-lg mx-auto">
        <NavBtn active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} icon="fa-house" />
        <NavBtn active={activeTab === 'DEPOSITS'} onClick={() => setActiveTab('DEPOSITS')} icon="fa-sack-dollar" />
        <NavBtn active={activeTab === 'LOANS'} onClick={() => setActiveTab('LOANS')} icon="fa-handshake-angle" />
        <NavBtn 
          active={activeTab === 'INBOX'} 
          onClick={() => setActiveTab('INBOX')} 
          icon="fa-inbox" 
          count={isManager ? appState.users.filter(u => u.status === UserStatus.PENDING).length : 0} 
        />
        <NavBtn active={activeTab === 'DEV'} onClick={() => setActiveTab('DEV')} icon="fa-user-gear" />
      </nav>
    </div>
  );
};

export default App;
