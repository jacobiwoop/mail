import React from 'react';
import { 
  Inbox, Send, File, AlertOctagon, Trash2, Settings, 
  Shield, Plus, Archive, Users, LayoutDashboard, BadgeCheck, ArrowLeftRight
} from 'lucide-react';
import { FolderId, User, UserRole } from '../types';

interface SidebarProps {
  selectedFolder: FolderId;
  onSelectFolder: (folder: FolderId) => void;
  onCompose: () => void;
  currentUser: User;
  onSwitchUserMode: () => void;
  appName: string;
  logoUrl: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  selectedFolder, 
  onSelectFolder, 
  onCompose, 
  currentUser,
  onSwitchUserMode,
  appName,
  logoUrl
}) => {
  
  const navItemClass = (id: FolderId) => `
    flex items-center px-4 py-2 my-1 mx-2 rounded-r-full cursor-pointer text-sm font-medium transition-colors duration-200
    ${selectedFolder === id 
      ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600' 
      : 'text-slate-600 hover:bg-slate-200 border-l-4 border-transparent'}
  `;

  return (
    <div className="w-64 h-full flex flex-col bg-slate-50 border-r border-slate-200 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center space-x-2">
         {logoUrl ? (
             <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
         ) : (
             <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {appName.charAt(0)}
             </div>
         )}
         <span className="text-xl font-semibold tracking-tight text-slate-800">{appName}</span>
      </div>

      {/* Compose Button */}
      <div className="px-4 pb-6">
        <button 
          onClick={onCompose}
          className="flex items-center space-x-3 bg-white hover:bg-slate-50 text-slate-700 px-5 py-4 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md w-full"
        >
          <Plus className="w-6 h-6 text-red-500" />
          <span className="text-base font-medium">Nouveau message</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div onClick={() => onSelectFolder(FolderId.INBOX)} className={navItemClass(FolderId.INBOX)}>
          <Inbox className="w-4 h-4 mr-3" /> Inbox
        </div>
        <div onClick={() => onSelectFolder(FolderId.SENT)} className={navItemClass(FolderId.SENT)}>
          <Send className="w-4 h-4 mr-3" /> Envoyés
        </div>
        <div onClick={() => onSelectFolder(FolderId.DRAFTS)} className={navItemClass(FolderId.DRAFTS)}>
          <File className="w-4 h-4 mr-3" /> Brouillons
        </div>
        <div onClick={() => onSelectFolder(FolderId.ARCHIVE)} className={navItemClass(FolderId.ARCHIVE)}>
          <Archive className="w-4 h-4 mr-3" /> Archivés
        </div>
        
        <div className="mt-6 mb-2 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Autres
        </div>
        <div onClick={() => onSelectFolder(FolderId.SPAM)} className={navItemClass(FolderId.SPAM)}>
          <AlertOctagon className="w-4 h-4 mr-3" /> Spam
        </div>
        <div onClick={() => onSelectFolder(FolderId.TRASH)} className={navItemClass(FolderId.TRASH)}>
          <Trash2 className="w-4 h-4 mr-3" /> Corbeille
        </div>

        <div className="mt-6 mb-2 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Système
        </div>
        <div className="flex items-center px-4 py-2 my-1 mx-2 text-slate-600 hover:bg-slate-200 rounded-r-full cursor-pointer text-sm">
          <Settings className="w-4 h-4 mr-3" /> Paramètres
        </div>
        <div className="flex items-center px-4 py-2 my-1 mx-2 text-slate-600 hover:bg-slate-200 rounded-r-full cursor-pointer text-sm">
          <Shield className="w-4 h-4 mr-3" /> Sécurité
        </div>

        {currentUser.role === UserRole.ADMIN && (
          <>
            <div className="mt-6 mb-2 px-6 text-xs font-bold text-red-500 uppercase tracking-wider flex items-center">
              <Shield className="w-3 h-3 mr-1" /> Administration
            </div>
            <div onClick={() => onSelectFolder(FolderId.ADMIN_ALL)} className={navItemClass(FolderId.ADMIN_ALL)}>
              <LayoutDashboard className="w-4 h-4 mr-3" /> Supervision
            </div>
            <div onClick={() => onSelectFolder(FolderId.ADMIN_USERS)} className={navItemClass(FolderId.ADMIN_USERS)}>
              <Users className="w-4 h-4 mr-3" /> Gestion Utilisateurs
            </div>
            <div onClick={() => onSelectFolder(FolderId.DUAL_MODE)} className={navItemClass(FolderId.DUAL_MODE)}>
              <ArrowLeftRight className="w-4 h-4 mr-3" /> Simulateur (Dual)
            </div>
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-100">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onSwitchUserMode}>
          <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full border border-white shadow-sm" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-slate-700 truncate flex items-center gap-1">
              {currentUser.name}
              {currentUser.isCertified && <BadgeCheck className="w-3 h-3 text-blue-500" />}
            </span>
            <span className="text-xs text-slate-500 truncate">{currentUser.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};