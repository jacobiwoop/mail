import React, { useState } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { User } from '../types';
import { ComposeForm } from './ComposeForm';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  initialData?: { to?: User[], subject?: string, body?: string, threadId?: string };
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, currentUser, initialData }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-0 right-20 bg-white rounded-t-lg shadow-2xl border border-slate-300 z-50 transition-all duration-200 flex flex-col ${isMinimized ? 'h-12 w-64' : 'h-[700px] w-[700px]'}`}>
      
      {/* Header */}
      <div 
        className="bg-slate-900 text-white px-4 py-3 rounded-t-lg flex justify-between items-center cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <span className="font-medium text-sm">Nouveau message</span>
        <div className="flex space-x-3 text-slate-300">
          {isMinimized ? <Maximize2 className="w-4 h-4 hover:text-white" /> : <Minimize2 className="w-4 h-4 hover:text-white" />}
          <X className="w-4 h-4 hover:text-white" onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>
      </div>

      {!isMinimized && (
        <ComposeForm 
            currentUser={currentUser}
            initialRecipients={initialData?.to}
            initialSubject={initialData?.subject}
            initialBody={initialData?.body}
            threadId={initialData?.threadId}
            onSend={onClose}
            onCancel={onClose}
        />
      )}
    </div>
  );
};