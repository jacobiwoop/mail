import React, { useState } from 'react';
import { 
  Reply, ReplyAll, Forward, MoreHorizontal, Printer, 
  Trash2, Star, Archive, ShieldAlert, BadgeCheck
} from 'lucide-react';
import { Email, User } from '../types';

interface EmailDetailProps {
  emails: Email[]; // The entire thread history
  currentUser: User;
  onReply: (type: 'reply' | 'replyAll' | 'forward') => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({ emails, currentUser, onReply }) => {
  if (!emails || emails.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
           <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
           </svg>
        </div>
        <p>Sélectionnez un message pour le lire</p>
      </div>
    );
  }

  const latestEmail = emails[emails.length - 1];
  const subject = latestEmail.subject;

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      {/* Thread Toolbar */}
      <div className="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-white flex-shrink-0">
         <div className="flex space-x-2">
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600" title="Archiver"><Archive className="w-5 h-5"/></button>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600" title="Signaler Spam"><ShieldAlert className="w-5 h-5"/></button>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600" title="Supprimer"><Trash2 className="w-5 h-5"/></button>
         </div>
         <div className="flex space-x-2">
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><Printer className="w-5 h-5"/></button>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><MoreHorizontal className="w-5 h-5"/></button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        
        {/* Subject Header */}
        <div className="flex justify-between items-start mb-8">
           <h1 className="text-2xl font-normal text-slate-900">{subject}</h1>
           <button className="text-slate-400 hover:text-yellow-400"><Star className="w-5 h-5" /></button>
        </div>

        {/* Thread Messages */}
        <div className="space-y-6">
          {emails.map((msg, idx) => {
            const isLast = idx === emails.length - 1;
            const isMe = msg.from.id === currentUser.id;
            
            return (
              <div key={msg.id} className={`transition-all ${isLast ? '' : 'opacity-80 hover:opacity-100 border-b border-slate-100 pb-4'}`}>
                
                {/* Message Header */}
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center space-x-3">
                      <img src={msg.from.avatar} className="w-10 h-10 rounded-full bg-slate-200" alt="" />
                      <div>
                        <div className="flex items-baseline space-x-2">
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                                {msg.from.name}
                                {msg.from.isCertified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                            </span>
                            <span className="text-xs text-slate-500">&lt;{msg.from.email}&gt;</span>
                        </div>
                        <div className="text-xs text-slate-500">
                           à {msg.to.map(u => u.name).join(', ')}
                        </div>
                      </div>
                   </div>
                   <span className="text-xs text-slate-500">
                     {new Date(msg.timestamp).toLocaleString()}
                   </span>
                </div>

                {/* Body */}
                <div className="text-sm text-slate-800 leading-relaxed pl-14 prose max-w-none" dangerouslySetInnerHTML={{ __html: msg.body }} />
                
              </div>
            );
          })}
        </div>

        {/* Action Buttons (at the bottom of thread) */}
        <div className="mt-8 pl-14 flex space-x-3">
           <button 
             onClick={() => onReply('reply')}
             className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              <Reply className="w-4 h-4" /> <span>Répondre</span>
           </button>
           <button 
             onClick={() => onReply('replyAll')}
             className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              <ReplyAll className="w-4 h-4" /> <span>Répondre à tous</span>
           </button>
           <button 
             onClick={() => onReply('forward')}
             className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              <Forward className="w-4 h-4" /> <span>Transférer</span>
           </button>
        </div>
      </div>
    </div>
  );
};