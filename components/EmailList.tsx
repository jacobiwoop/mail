import { Search, Star, BadgeCheck } from 'lucide-react';
import { Thread, FolderId } from '../types';

interface EmailListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  folderId: FolderId;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const EmailList: React.FC<EmailListProps> = ({ 
  threads, 
  selectedThreadId, 
  onSelectThread,
  folderId,
  searchQuery,
  onSearchChange
}) => {
  
  // Simple format for time
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getFolderTitle = (id: FolderId) => {
      switch(id) {
          case FolderId.INBOX: return 'Boîte de réception';
          case FolderId.SENT: return 'Messages envoyés';
          case FolderId.DRAFTS: return 'Brouillons';
          case FolderId.SPAM: return 'Spam';
          case FolderId.TRASH: return 'Corbeille';
          case FolderId.ARCHIVE: return 'Archives';
          case FolderId.ADMIN_ALL: return 'Supervision Globale';
          default: return 'Messages';
      }
  }

  const filteredThreads = threads.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-96 flex flex-col bg-white border-r border-slate-200 flex-shrink-0 h-full">
      {/* Header & Search */}
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{getFolderTitle(folderId)}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none placeholder-slate-500 text-slate-700"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
               <span className="text-sm">Aucun message</span>
           </div>
        ) : (
            filteredThreads.map(thread => {
            const lastMessage = thread.messages[thread.messages.length - 1];
            // Identify display name: In Sent folder, show recipient. In Inbox, show sender.
            // Also need to get the User object to check certification
            const displayUserObj = folderId === FolderId.SENT 
                ? (lastMessage.to[0]) 
                : (lastMessage.from);
                
            const displayUser = displayUserObj?.name || 'Unknown';
            const isCertified = displayUserObj?.isCertified;

            return (
                <div 
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`
                    group px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors relative
                    ${selectedThreadId === thread.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 hover:shadow-inner'}
                    ${thread.hasUnread ? 'bg-white' : 'bg-slate-50/30'}
                `}
                >
                    {thread.hasUnread && (
                        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1 h-14 bg-blue-500 rounded-r-md"></div>
                    )}
                    
                    <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-sm truncate pr-2 flex items-center gap-1 ${thread.hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {displayUser}
                        {isCertified && <BadgeCheck className="w-3 h-3 text-blue-500" />}
                        {thread.messages.length > 1 && <span className="ml-1 text-xs text-slate-400 font-normal">({thread.messages.length})</span>}
                        </span>
                        <span className={`text-xs whitespace-nowrap ${thread.hasUnread ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>
                        {formatTime(thread.lastTimestamp)}
                        </span>
                    </div>

                    <div className={`text-sm mb-1 truncate ${thread.hasUnread ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                        {thread.subject}
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-500 truncate w-11/12" dangerouslySetInnerHTML={{ __html: lastMessage.body.replace(/<[^>]*>?/gm, '').substring(0, 60) + '...' }}></div>
                        <Star className={`w-4 h-4 ${lastMessage.isStarred ? 'text-yellow-400 fill-current' : 'text-slate-300 group-hover:text-slate-400'}`} />
                    </div>
                </div>
            );
            })
        )}
      </div>
    </div>
  );
};