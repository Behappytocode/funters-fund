
import React, { useState } from 'react';
import { AppState, Loan, Installment, UserStatus } from '../types';
import { formatCurrency, calculate7030, generateId } from '../utils';

interface LoansPageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  isManager: boolean;
}

const LoansPage: React.FC<LoansPageProps> = ({ appState, setAppState, isManager }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newLoan, setNewLoan] = useState({
    memberId: '',
    totalAmount: 0,
    termMonths: 6,
    issueDate: new Date().toISOString().split('T')[0]
  });

  const members = appState.users.filter(u => u.status === UserStatus.APPROVED);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.memberId || !newLoan.totalAmount) return;

    const { recoverable, waiver } = calculate7030(newLoan.totalAmount);
    const member = members.find(m => m.id === newLoan.memberId);

    // Generate installments
    const installmentAmount = Math.round(recoverable / newLoan.termMonths);
    const installments: Installment[] = [];
    const baseDate = new Date(newLoan.issueDate);

    for (let i = 1; i <= newLoan.termMonths; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(baseDate.getMonth() + i);
      installments.push({
        id: generateId(),
        dueDate: dueDate.toISOString().split('T')[0],
        amount: installmentAmount,
        paid: false
      });
    }

    const loan: Loan = {
      id: generateId(),
      memberId: newLoan.memberId,
      memberName: member?.name || 'Unknown',
      totalAmount: newLoan.totalAmount,
      recoverableAmount: recoverable,
      waiverAmount: waiver,
      issueDate: newLoan.issueDate,
      termMonths: newLoan.termMonths,
      status: 'ACTIVE',
      installments
    };

    setAppState(prev => ({
      ...prev,
      loans: [loan, ...prev.loans]
    }));
    setShowAdd(false);
  };

  const handlePayInstallment = (loanId: string, installmentId: string) => {
    if (!isManager) return;
    setAppState(prev => {
      const updatedLoans = prev.loans.map(l => {
        if (l.id === loanId) {
          const updatedInstallments = l.installments.map(ins => {
            if (ins.id === installmentId) {
              return { ...ins, paid: true, paymentDate: new Date().toISOString() };
            }
            return ins;
          });
          const allPaid = updatedInstallments.every(ins => ins.paid);
          return { ...l, installments: updatedInstallments, status: allPaid ? 'COMPLETED' : 'ACTIVE' };
        }
        return l;
      });
      return { ...prev, loans: updatedLoans };
    });
  };

  const filteredLoans = isManager 
    ? appState.loans 
    : appState.loans.filter(l => l.memberId === appState.currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Emergency Loans</h2>
          <p className="text-sm text-slate-500">Manage 70/30 recovery funds.</p>
        </div>
        {isManager && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-100 flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i> Issue Loan
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-amber-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-lg mb-4 text-amber-600">New Loan Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Member</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={newLoan.memberId}
                onChange={e => setNewLoan({...newLoan, memberId: e.target.value})}
                required
              >
                <option value="">Choose a member...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Requested Total (Rs.)</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="0.00"
                value={newLoan.totalAmount || ''}
                onChange={e => setNewLoan({...newLoan, totalAmount: Number(e.target.value)})}
                required
              />
              {newLoan.totalAmount > 0 && (
                <div className="mt-2 flex gap-4">
                  <div className="flex-1 bg-indigo-50 p-2 rounded-lg">
                    <p className="text-[8px] font-black text-indigo-400 uppercase">Recoverable (70%)</p>
                    <p className="text-xs font-bold text-indigo-700">{formatCurrency(newLoan.totalAmount * 0.7)}</p>
                  </div>
                  <div className="flex-1 bg-amber-50 p-2 rounded-lg">
                    <p className="text-[8px] font-black text-amber-400 uppercase">Waiver (30%)</p>
                    <p className="text-xs font-bold text-amber-700">{formatCurrency(newLoan.totalAmount * 0.3)}</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Term (Months)</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={newLoan.termMonths}
                onChange={e => setNewLoan({...newLoan, termMonths: Number(e.target.value)})}
              >
                {[6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m} Months</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowAdd(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-100"
              >
                Issue Fund
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
            <i className="fa-solid fa-handshake-angle text-3xl text-slate-300 mb-2"></i>
            <p className="text-slate-400 text-sm">No active loans.</p>
          </div>
        ) : (
          filteredLoans.map(l => (
            <div key={l.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${l.status === 'ACTIVE' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <i className={`fa-solid ${l.status === 'ACTIVE' ? 'fa-hourglass-half' : 'fa-circle-check'}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{l.memberName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{l.termMonths} Months Term</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">{formatCurrency(l.recoverableAmount)}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Recoverable Amount</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Installments Schedule</span>
                  <span className="text-[10px] font-black text-indigo-600">
                    {l.installments.filter(i => i.paid).length} / {l.installments.length} PAID
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar pr-1">
                  {l.installments.map((ins, idx) => (
                    <div key={ins.id} className="bg-white p-3 rounded-2xl flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center text-[9px] font-black text-slate-400">{idx + 1}</span>
                        <div>
                          <p className="text-[11px] font-bold text-slate-700">{formatCurrency(ins.amount)}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">{new Date(ins.dueDate).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      {ins.paid ? (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase">
                          <i className="fa-solid fa-check-double"></i> Done
                        </div>
                      ) : (
                        isManager && (
                          <button 
                            onClick={() => handlePayInstallment(l.id, ins.id)}
                            className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-1 rounded-lg uppercase border border-indigo-100 active:scale-95 transition-transform"
                          >
                            Mark Paid
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50/30 flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-600 uppercase">30% Waiver Applied</span>
                <span className="text-xs font-black text-amber-600">{formatCurrency(l.waiverAmount)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoansPage;
