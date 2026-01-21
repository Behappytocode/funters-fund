
import React, { useState } from 'react';
import { AppState, UserStatus, Deposit } from '../types';
import { formatCurrency } from '../utils';
import { supabase } from '../supabase';

interface DepositsPageProps {
  appState: AppState;
  refresh: () => void;
  isManager: boolean;
}

const DepositsPage: React.FC<DepositsPageProps> = ({ appState, refresh, isManager }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newDeposit, setNewDeposit] = useState({ amount: 0, paymentDate: new Date().toISOString().split('T')[0], memberId: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const members = appState.users.filter(u => u.status === UserStatus.APPROVED);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('deposits').insert({
      member_id: newDeposit.memberId,
      amount: newDeposit.amount,
      payment_date: newDeposit.paymentDate,
      notes: newDeposit.notes
    });

    if (!error) {
      refresh();
      setShowAdd(false);
      setNewDeposit({ amount: 0, paymentDate: new Date().toISOString().split('T')[0], memberId: '', notes: '' });
    }
    setLoading(false);
  };

  const filteredDeposits = isManager 
    ? appState.deposits 
    : appState.deposits.filter(d => d.memberId === appState.currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Deposits</h2>
          <p className="text-sm text-slate-500">Track member contributions.</p>
        </div>
        {isManager && (
          <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 flex items-center gap-2">
            <i className="fa-solid fa-plus"></i> New Log
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-indigo-100">
          <h3 className="font-bold text-lg mb-4 text-indigo-600">Log New Contribution</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Member</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newDeposit.memberId}
                onChange={e => setNewDeposit({...newDeposit, memberId: e.target.value})}
                required
              >
                <option value="">Choose a member...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount (Rs.)</label>
              <input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={newDeposit.amount || ''} onChange={e => setNewDeposit({...newDeposit, amount: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Payment Date</label>
              <input type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={newDeposit.paymentDate} onChange={e => setNewDeposit({...newDeposit, paymentDate: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm">Cancel</button>
              <button disabled={loading} type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm">{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredDeposits.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
            <i className="fa-solid fa-folder-open text-3xl text-slate-300 mb-2"></i>
            <p className="text-slate-400 text-sm">No deposits found.</p>
          </div>
        ) : (
          filteredDeposits.map(d => (
            <div key={d.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><i className="fa-solid fa-file-invoice-dollar text-xl"></i></div>
                <div>
                  <h4 className="font-bold text-slate-800">{d.memberName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(d.paymentDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-indigo-600">{formatCurrency(d.amount)}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-bold uppercase"><i className="fa-solid fa-check-circle text-emerald-500"></i> Verified</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DepositsPage;
