import React from 'react';
import { User, UserRole } from '../types';
import { BadgeCheck, X, LogIn } from 'lucide-react';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSwitch: (user: User) => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSwitch
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             Switch Accounts
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* User List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
            {users.map(user => {
                const isActive = user.id === currentUser.id;
                return (
                    <div 
                        key={user.id}
                        onClick={() => !isActive && onSwitch(user)}
                        className={`
                            flex items-center justify-between p-4 rounded-lg border transition-all
                            ${isActive 
                                ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200 cursor-default' 
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img src={user.avatar} className="w-12 h-12 rounded-full border border-slate-200" alt={user.name} />
                                {isActive && (
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-1">
                                    {user.name}
                                    {user.isCertified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                                </h4>
                                <p className="text-sm text-slate-500">{user.email}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${user.role === UserRole.ADMIN ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {!isActive && (
                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full">
                                <LogIn size={20} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
            Selected account will be active immediately.
        </div>
      </div>
    </div>
  );
};
