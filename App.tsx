import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import { ComposeModal } from './components/ComposeModal';
import { AdminPanel } from './components/AdminPanel';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { DualMode } from './components/DualMode';
import { mailStore } from './services/mailStore';
import { MOCK_USERS } from './services/mockData';
import { AppState, FolderId, UserRole, User } from './types';

function App() {
  const [state, setState] = useState<AppState>({
    currentUser: MOCK_USERS[0], // Start as regular user
    selectedFolder: FolderId.INBOX,
    selectedThreadId: null,
    isComposeOpen: false,
    searchQuery: ''
  });
  
  const [dataVersion, setDataVersion] = useState(0);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const settings = mailStore.getSettings();

  // Subscribe to store updates
  useEffect(() => {
    return mailStore.subscribe(() => {
      setDataVersion(v => v + 1);
    });
  }, []);

  // Fetch derived data
  const threads = mailStore.getThreads(state.selectedFolder, state.currentUser.id);
  const selectedThreadMessages = state.selectedThreadId ? mailStore.getThreadDetails(state.selectedThreadId) : [];
  
  // Mark read when opening a thread
  useEffect(() => {
    if (state.selectedThreadId) {
      mailStore.markThreadRead(state.selectedThreadId, state.currentUser.id);
    }
  }, [state.selectedThreadId, state.currentUser.id]);

  const handleCompose = () => {
    setState(s => ({ ...s, isComposeOpen: true }));
  };

  const handleSwitchUser = () => {
    setIsUserSwitcherOpen(true);
  };

  const handleUserSelect = (user: User) => {
    setState(s => ({
      ...s,
      currentUser: user,
      selectedFolder: FolderId.INBOX,
      selectedThreadId: null
    }));
    setIsUserSwitcherOpen(false);
  };

  const handleReply = (type: 'reply' | 'replyAll' | 'forward') => {
      // For now, open compose with pre-filled data.
      // In a full app, this would be inline or specific logic.
      if (!state.selectedThreadId) return;
      
      const lastMsg = selectedThreadMessages[selectedThreadMessages.length - 1];
      const subjectPrefix = type === 'forward' ? 'Fwd: ' : 'Re: ';
      let newSubject = lastMsg.subject;
      if (!newSubject.startsWith(subjectPrefix)) newSubject = subjectPrefix + newSubject;

      // Determine recipients
      let toUsers = [lastMsg.from];
      if (type === 'replyAll') {
          toUsers = [...toUsers, ...lastMsg.to].filter(u => u.id !== state.currentUser.id);
      }
      if (type === 'forward') toUsers = [];

      setState(s => ({ ...s, isComposeOpen: true }));
      // We need to pass this context to the modal, effectively done via "initialData" prop in render
  };

  // Prepare Compose Props based on context (reply vs new)
  // Simplification: We rely on the fact that if isComposeOpen is true and we just clicked reply, 
  // we might want to pass data. For this mockup, simple state boolean is tricky for passing props dynamically
  // without a more complex modal manager. 
  // We'll just pass reply context if a thread is selected and visible.
  
  const activeReplyContext = state.isComposeOpen && state.selectedThreadId ? {
     subject: selectedThreadMessages.length > 0 ? `Re: ${selectedThreadMessages[selectedThreadMessages.length-1].subject}` : '',
     to: selectedThreadMessages.length > 0 ? [selectedThreadMessages[selectedThreadMessages.length-1].from] : [],
     threadId: state.selectedThreadId
  } : undefined;

  // Decide what to render in main area
  const renderMainContent = () => {
      return (
        <>
           <EmailList 
              threads={threads}
              selectedThreadId={state.selectedThreadId}
              onSelectThread={(id) => setState(s => ({ ...s, selectedThreadId: id }))}
              folderId={state.selectedFolder}
              searchQuery={state.searchQuery}
              onSearchChange={(q) => setState(s => ({ ...s, searchQuery: q }))}
           />
           <EmailDetail 
              emails={selectedThreadMessages}
              currentUser={state.currentUser}
              onReply={handleReply}
           />
        </>
      );
  };

  return (
    <Layout>
      <Sidebar 
        selectedFolder={state.selectedFolder}
        onSelectFolder={(f) => setState(s => ({ ...s, selectedFolder: f, selectedThreadId: null }))}
        onCompose={handleCompose}
        currentUser={state.currentUser}
        onSwitchUserMode={handleSwitchUser}
        appName={settings.appName}
        logoUrl={settings.logoUrl}
      />
      
      {state.selectedFolder === FolderId.DUAL_MODE ? (
          <DualMode />
      ) : state.selectedFolder === FolderId.ADMIN_USERS ? (
          <AdminPanel users={mailStore.getUsers()} currentSettings={settings} />
      ) : (
          renderMainContent()
      )}

      <ComposeModal 
        isOpen={state.isComposeOpen}
        onClose={() => setState(s => ({ ...s, isComposeOpen: false }))}
        currentUser={state.currentUser}
        initialData={activeReplyContext}
      />

      <UserSwitcherModal 
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        users={mailStore.getUsers()}
        currentUser={state.currentUser}
        onSwitch={handleUserSelect}
      />
    </Layout>
  );
}

export default App;