
import React, { useState } from 'react';
import { AppState } from '../types';

interface DevProfileProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  isManager: boolean;
}

const DevProfile: React.FC<DevProfileProps> = ({ appState, setAppState, isManager }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDev, setEditedDev] = useState(appState.developerInfo);
  const { developerInfo: dev } = appState;

  const handleSave = () => {
    setAppState(prev => ({ ...prev, developerInfo: editedDev }));
    setIsEditing(false);
  };

  return (
    <div className="max-w-md mx-auto relative h-full flex flex-col">
      {/* Background Banner */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-indigo-600 rounded-3xl -mx-4 -mt-6">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="relative pt-16 flex flex-col items-center">
        {/* Profile Picture */}
        <div className="relative mb-6">
          <div className="w-40 h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-100 p-1">
            <img src={dev.profilePic} alt={dev.name} className="w-full h-full object-cover rounded-full" />
          </div>
          {isManager && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="absolute bottom-2 right-2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-indigo-600 border border-slate-50"
            >
              <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-pen-to-square'}`}></i>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="w-full bg-white p-6 rounded-3xl shadow-xl space-y-4 border border-indigo-100">
             <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Developer Name</label>
              <input value={editedDev.name} onChange={e => setEditedDev({...editedDev, name: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm border focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Title</label>
              <input value={editedDev.title} onChange={e => setEditedDev({...editedDev, title: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm border focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bio</label>
              <textarea value={editedDev.bio} onChange={e => setEditedDev({...editedDev, bio: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl text-sm border focus:ring-2 focus:ring-indigo-500 h-24" />
            </div>
            <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-100">Save Profile</button>
          </div>
        ) : (
          <div className="text-center px-4 space-y-6">
            <div>
              <h2 className="text-4xl font-black text-slate-800">{dev.name}</h2>
              <p className="text-indigo-600 font-black tracking-[0.2em] text-xs uppercase mt-2">{dev.title}</p>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 justify-center">
              <SocialBtn icon="fa-github" href={dev.github} />
              <SocialBtn icon="fa-linkedin-in" href={dev.linkedin} />
              <SocialBtn icon="fa-envelope" href={`mailto:${dev.email}`} />
            </div>

            <p className="text-slate-500 text-base leading-relaxed max-w-sm mx-auto font-medium">
              {dev.bio}
            </p>

            <div className="pt-4 pb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Available for collaboration</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SocialBtn: React.FC<{ icon: string, href?: string }> = ({ icon, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 active:scale-90"
  >
    <i className={`fa-brands ${icon} text-lg`}></i>
  </a>
);

export default DevProfile;
