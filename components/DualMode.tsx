import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { mailStore } from '../services/mailStore';
import { ComposeForm } from './ComposeForm';
import { ArrowLeftRight, MessagesSquare, User as UserIcon } from 'lucide-react';

export const DualMode: React.FC = () => {
    // Selection state
    const [userA, setUserA] = useState<User | null>(null);
    const [userB, setUserB] = useState<User | null>(null);
    
    // Conversation data state
    const [conversation, setConversation] = useState(mailStore.getConversation(userA?.id || '', userB?.id || ''));
    const [dataVersion, setDataVersion] = useState(0);

    // Subscribe to store updates to refresh the middle panel
    useEffect(() => {
        return mailStore.subscribe(() => {
            setDataVersion(v => v + 1);
        });
    }, []);

    // Refresh conversation when version changes or users change
    useEffect(() => {
        if (userA && userB) {
            setConversation(mailStore.getConversation(userA.id, userB.id));
        } else {
            setConversation([]);
        }
    }, [userA, userB, dataVersion]);

    const users = mailStore.getUsers();

    if (!userA || !userB) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl w-full border border-slate-200">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ArrowLeftRight className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Simulateur d'Échange</h1>
                    <p className="text-slate-500 mb-8">Sélectionnez deux utilisateurs pour ouvrir une session de communication en temps réel et simuler un échange de courriels.</p>

                    <div className="grid grid-cols-2 gap-8 mb-8 relative">
                         {/* User A Selector */}
                         <div className="flex flex-col text-left">
                            <label className="text-sm font-semibold text-slate-700 mb-2">Utilisateur Gauche (A)</label>
                            <select 
                                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-slate-50"
                                value={userA?.id || ''}
                                onChange={(e) => setUserA(users.find(u => u.id === e.target.value) || null)}
                            >
                                <option value="">Choisir...</option>
                                {users.filter(u => u.id !== userB?.id).map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                         </div>

                         {/* Separator Icon */}
                         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-2 shadow-sm z-10">
                            <ArrowLeftRight className="w-5 h-5 text-slate-400" />
                         </div>

                         {/* User B Selector */}
                         <div className="flex flex-col text-left">
                            <label className="text-sm font-semibold text-slate-700 mb-2">Utilisateur Droite (B)</label>
                            <select 
                                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-slate-50"
                                value={userB?.id || ''}
                                onChange={(e) => setUserB(users.find(u => u.id === e.target.value) || null)}
                            >
                                <option value="">Choisir...</option>
                                {users.filter(u => u.id !== userA?.id).map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                         </div>
                    </div>

                    <button 
                        disabled={!userA || !userB}
                        onClick={() => { /* State is already set, just letting React re-render */ }}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${userA && userB ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        Démarrer la Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex h-screen overflow-hidden bg-slate-100">
            {/* Header / Top Bar for Exit */}
            <div className="absolute top-4 right-4 z-50">
                 <button 
                    onClick={() => { setUserA(null); setUserB(null); }}
                    className="bg-white/90 backdrop-blur text-slate-600 px-4 py-2 rounded-full shadow-sm border border-slate-200 hover:bg-red-50 hover:text-red-600 font-medium text-sm transition-colors"
                 >
                    Quitter la session
                 </button>
            </div>

            {/* Left Panel: User A */}
            <div className="flex-1 flex flex-col border-r border-slate-200 bg-white shadow-xl z-10 max-w-[40%]">
                 <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center">
                    <img src={userA.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm mr-3" alt="" />
                    <div>
                        <h3 className="font-bold text-slate-800">{userA.name}</h3>
                        <p className="text-xs text-slate-500">{userA.email}</p>
                    </div>
                 </div>
                 <ComposeForm 
                    currentUser={userA}
                    initialRecipients={[userB]}
                    className="h-full"
                 />
            </div>

            {/* Middle Panel: History */}
            <div className="flex-1 overflow-y-auto px-4 py-8 max-w-[20%] bg-slate-100">
                <div className="text-center mb-6">
                    <span className="bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                        Historique
                    </span>
                </div>
                
                <div className="space-y-4">
                    {conversation.length === 0 && (
                        <div className="text-center text-slate-400 italic text-sm mt-10">
                            Aucun échange pour le moment.
                        </div>
                    )}
                    {conversation.map(email => {
                        const isFromA = email.from.id === userA.id;
                        return (
                            <div 
                                key={email.id} 
                                className={`flex flex-col p-3 rounded-lg border text-xs shadow-sm ${isFromA ? 'bg-white border-slate-200 ml-2' : 'bg-blue-50 border-blue-100 mr-2'}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`font-bold ${isFromA ? 'text-slate-700' : 'text-blue-700'}`}>
                                        {isFromA ? userA.name : userB.name}
                                    </span>
                                    <span className="text-slate-400 text-[10px]">
                                        {new Date(email.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="font-medium text-slate-800 mb-1 truncate">{email.subject}</div>
                                <div className="text-slate-500 line-clamp-2" dangerouslySetInnerHTML={{__html: email.body}} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Panel: User B */}
            <div className="flex-1 flex flex-col border-l border-slate-200 bg-white shadow-xl z-10 max-w-[40%]">
                 <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-end text-right">
                    <div>
                        <h3 className="font-bold text-slate-800">{userB.name}</h3>
                        <p className="text-xs text-slate-500">{userB.email}</p>
                    </div>
                    <img src={userB.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm ml-3" alt="" />
                 </div>
                 <ComposeForm 
                    currentUser={userB}
                    initialRecipients={[userA]}
                    className="h-full"
                 />
            </div>
        </div>
    );
};
