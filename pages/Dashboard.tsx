
import React, { useMemo } from 'react';
import { AppState, UserStatus } from '../types.ts';
import { formatCurrency } from '../utils.ts';
import { AreaChart, Area, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC<{ appState: AppState }> = ({ appState }) => {
  const stats = useMemo(() => {
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

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon="fa-sack-dollar" color="bg-indigo-500" label="BALANCE" value={formatCurrency(stats.currentBalance)} />
        <StatCard icon="fa-arrow-trend-up" color="bg-emerald-500" label="DEPOSITS" value={formatCurrency(stats.totalDeposits)} />
        <StatCard icon="fa-arrow-up-right-from-square" color="bg-amber-500" label="LOANS" value={formatCurrency(stats.totalLoansIssued)} />
        <StatCard icon="fa-arrow-down-left-and-arrow-up-right-to-center" color="bg-blue-500" label="RECOVERIES" value={formatCurrency(stats.totalRecoveries)} />
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-end">
          <div><p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">MEMBERS</p><p className="text-3xl font-bold">{stats.totalMembers}</p></div>
          <div className="text-right"><p className="text-amber-400 text-[10px] uppercase font-bold tracking-widest mb-1">WAIVER TOTAL</p><p className="text-3xl font-bold text-amber-400">{formatCurrency(stats.totalWaivers)}</p></div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: string, color: string, label: string, value: string }> = ({ icon, color, label, value }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
    <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2`}><i className={`fa-solid ${icon} text-sm`}></i></div>
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</span>
    <span className="text-sm font-black text-slate-800">{value}</span>
  </div>
);

export default Dashboard;
