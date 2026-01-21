
import React, { useMemo } from 'react';
import { AppState, UserStatus } from '../types';
import { formatCurrency } from '../utils';
import { AreaChart, Area, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC<{ appState: AppState }> = ({ appState }) => {
  const stats = useMemo(() => {
    // Safety checks for undefined arrays
    const deposits = appState.deposits || [];
    const loans = appState.loans || [];
    const users = appState.users || [];

    const totalDeposits = deposits.reduce((acc, d) => acc + (d.amount || 0), 0);
    const totalLoansIssued = loans.reduce((acc, l) => acc + (l.totalAmount || 0), 0);
    const totalWaivers = loans.reduce((acc, l) => acc + (l.waiverAmount || 0), 0);
    
    let totalRecoveries = 0;
    loans.forEach(l => {
      (l.installments || []).forEach(ins => {
        if (ins.paid) totalRecoveries += (ins.amount || 0);
      });
    });

    const currentBalance = totalDeposits - totalLoansIssued + totalRecoveries;
    const totalMembers = users.filter(u => u.status === UserStatus.APPROVED).length;

    return {
      currentBalance,
      totalDeposits,
      totalLoansIssued,
      totalRecoveries,
      totalWaivers,
      totalMembers
    };
  }, [appState]);

  // Chart Data: Fund Growth (Simplified for mock)
  const growthData = [
    { name: 'Jan', balance: stats.totalDeposits * 0.4 },
    { name: 'Feb', balance: stats.totalDeposits * 0.6 },
    { name: 'Mar', balance: stats.totalDeposits * 0.8 },
    { name: 'Apr', balance: stats.totalDeposits },
  ];

  const pieData = [
    { name: 'Recoveries', value: stats.totalRecoveries || 0.1 },
    { name: 'Waivers', value: stats.totalWaivers || 0.1 },
    { name: 'Pending', value: Math.max(0.1, stats.totalLoansIssued - stats.totalRecoveries - stats.totalWaivers) },
  ];

  const COLORS = ['#6366f1', '#f59e0b', '#e2e8f0'];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Portfolio Status</h2>
        <p className="text-sm text-slate-500">Automated fund tracking & audit overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon="fa-sack-dollar" 
          color="bg-indigo-500" 
          label="CURRENT BALANCE" 
          value={formatCurrency(stats.currentBalance)} 
        />
        <StatCard 
          icon="fa-arrow-trend-up" 
          color="bg-emerald-500" 
          label="TOTAL DEPOSITS" 
          value={formatCurrency(stats.totalDeposits)} 
        />
        <StatCard 
          icon="fa-arrow-up-right-from-square" 
          color="bg-amber-500" 
          label="TOTAL LOANS" 
          value={formatCurrency(stats.totalLoansIssued)} 
        />
        <StatCard 
          icon="fa-arrow-down-left-and-arrow-up-right-to-center" 
          color="bg-blue-500" 
          label="RECOVERIES" 
          value={formatCurrency(stats.totalRecoveries)} 
        />
      </div>

      {/* Waiver Audit Summary */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-1">Waiver Audit Summary</h3>
          <p className="text-slate-400 text-xs mb-6">Total non-recoverable portion (30% Rule)</p>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">TOTAL MEMBERS</p>
              <p className="text-3xl font-bold">{stats.totalMembers}</p>
            </div>
            <div className="text-right">
              <p className="text-amber-400 text-[10px] uppercase font-bold tracking-widest mb-1">WAIVER TOTAL</p>
              <p className="text-3xl font-bold text-amber-400">{formatCurrency(stats.totalWaivers)}</p>
            </div>
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-4">Fund Growth Trend</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h4 className="font-bold text-slate-800 mb-2 w-full">Loan Distribution</h4>
          <div className="h-56 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> Recovery</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Waivers</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: string, color: string, label: string, value: string }> = ({ icon, color, label, value }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-100`}>
      <i className={`fa-solid ${icon} text-xl`}></i>
    </div>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-lg font-black text-slate-800">{value}</span>
  </div>
);

export default Dashboard;
