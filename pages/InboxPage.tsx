import React from 'react';
import { AppState, UserStatus } from '../types.ts';
import { supabase } from '../supabase.ts';

interface InboxPageProps {
  appState: AppState;
  refresh: () => void;
  isManager: boolean;
}

const InboxPage: React.FC<InboxPageProps> = ({ appState, refresh, isManager }) => {
  const pendingUsers = appState.users.filter(u => u.status === UserStatus.PENDING);

  const handleAction = async (userId: string, status: UserStatus) => {
    // Correctly update database
    const { error } = await supabase
      .from('profiles')
      .update({ status: status })
      .eq('id', userId);

    if (!error) {
      refresh(); // Reload data from DB to reflect change
    } else {
      alert("Error updating user: " + error.message);
    }
  };

  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <i className="fa-solid fa-lock text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500">Only the Fund Manager can access user approvals and management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Member Inbox</h2>
        <p className="text-sm text-slate-500">Approve or manage member requests.</p>
      </div>

      <div className="space-y-4">
        {pendingUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <i className="fa-solid fa-envelope-open text-3xl text-slate-200 mb-2"></i>
            <p className="text-slate-400 text-sm font-medium">No pending requests.</p>
          </div>
        ) : (
          pendingUsers.map(user => (
            <div key={user.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <img src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=128`} alt={user.name} />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-slate-800 leading-tight">{user.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-tight">New Member Request</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(user.id, UserStatus.REJECTED)}
                  className="flex-1 py-3 rounded-2xl text-slate-400 font-bold text-sm bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  Decline
                </button>
                <button 
                  onClick={() => handleAction(user.id, UserStatus.APPROVED)}
                  className="flex-1 py-3 rounded-2xl text-white font-bold text-sm bg-indigo-600 shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
                >
                  Approve
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approved Members List (ReadOnly) */}
      <div className="mt-8">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Active Members</h3>
        <div className="space-y-3">
          {appState.users.filter(u => u.status === UserStatus.APPROVED).map(u => (
            <div key={u.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-50">
              <div className="flex items-center gap-3">
                <img src={u.profilePic || `https://ui-avatars.com/api/?name=${u.name}&background=f1f5f9&color=64748b`} className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{u.name}</p>
                  <p className="text-[10px] text-slate-400">{u.role}</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
