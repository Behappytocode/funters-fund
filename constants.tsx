
import React from 'react';

export const CURRENCY = 'Rs.';

export const INITIAL_DEVELOPER = {
  name: "Abubakar",
  title: "FULL STACK DEVELOPER",
  bio: "I'm Abubakar, the developer behind this Fund Manager platform. I am a Full Stack Developer dedicated to building robust, scalable applications that simplify community management and financial coordination.",
  profilePic: "https://picsum.photos/seed/dev/300/300",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  email: "abubakar@example.com"
};

export const LOGO = (
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
      <i className="fa-solid fa-handshake text-xl"></i>
    </div>
    <div>
      <h1 className="font-bold text-lg leading-tight text-slate-800">Funters Fund</h1>
      <p className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">Friendship that Stands in Crisis</p>
    </div>
  </div>
);
