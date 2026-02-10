import { AppSettings, Email, FolderId, Thread, User, UserRole } from '../types';
import { INITIAL_EMAILS, MOCK_USERS } from './mockData';

class MailStore {
  private emails: Email[] = [...INITIAL_EMAILS];
  private users: User[] = [...MOCK_USERS];
  
  private settings: AppSettings = {
    appName: 'INTERAC Internal',
    logoUrl: '' // Empty means default logic
  };

  // Listeners for simplistic state management
  private listeners: (() => void)[] = [];

  constructor() {
    // Load from local storage if needed, skipping for this demo to ensure fresh state
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  getUsers() {
    return this.users;
  }
  
  getSettings() {
      return this.settings;
  }

  updateSettings(newSettings: AppSettings) {
      this.settings = newSettings;
      this.notify();
  }

  createUser(name: string, email: string, role: UserRole, isCertified: boolean = false, avatar?: string) {
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      role,
      avatar: avatar || `https://picsum.photos/200/200?random=${Date.now()}`,
      isCertified
    };
    this.users.push(newUser);
    this.notify();
    return newUser;
  }

  // Get threads relevant to a folder and user
  getThreads(folderId: FolderId, userId: string): Thread[] {
    let filteredEmails = this.emails;

    // Filter by Folder Logic
    if (folderId === FolderId.ADMIN_ALL) {
      // Admin sees EVERYTHING
      // No filter applied on emails array effectively
    } else if (folderId === FolderId.SENT) {
        filteredEmails = this.emails.filter(e => e.from.id === userId && e.folder === FolderId.SENT);
    } else {
        // Standard folders (Inbox, Trash, Spam, etc.)
        // We look for emails sent TO the user that are in the requested folder
        // OR emails stored by the user in that folder (if we had move logic)
        filteredEmails = this.emails.filter(e => {
            const isRecipient = e.to.some(u => u.id === userId) || e.cc.some(u => u.id === userId) || e.bcc.some(u => u.id === userId);
            // In a real backend, 'folder' is a property of the relation User<->Email. 
            // Here we simplify: if email is in INBOX and user is recipient, they see it.
            return isRecipient && e.folder === folderId;
        });
    }

    // Group by Thread ID
    const threadMap = new Map<string, Email[]>();
    filteredEmails.forEach(email => {
      const current = threadMap.get(email.threadId) || [];
      threadMap.set(email.threadId, [...current, email]);
    });

    // Convert to Thread Objects
    const threads: Thread[] = [];
    threadMap.forEach((msgs, threadId) => {
      // For display, we might need info from the *entire* conversation history, 
      // not just the messages in this folder. But for sidebar counts, usually it's per folder.
      // Let's grab the full conversation context for the detail view logic later.
      // Here we just sort by date.
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      
      const lastMsg = msgs[msgs.length - 1];
      const participants = Array.from(new Set(msgs.map(m => m.from).concat(msgs.flatMap(m => m.to))));

      threads.push({
        id: threadId,
        subject: lastMsg.subject,
        messages: msgs,
        lastTimestamp: lastMsg.timestamp,
        hasUnread: msgs.some(m => !m.isRead),
        participants: participants
      });
    });

    return threads.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  }

  // Get full conversation (all folders) for a thread ID
  getThreadDetails(threadId: string): Email[] {
    return this.emails
      .filter(e => e.threadId === threadId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  markThreadRead(threadId: string, userId: string) {
    let changed = false;
    this.emails.forEach(e => {
      if (e.threadId === threadId && !e.isRead) {
         // In a real app check if userId is recipient
         e.isRead = true;
         changed = true;
      }
    });
    if (changed) this.notify();
  }

  sendEmail(fromUser: User, toUsers: User[], subject: string, body: string, parentThreadId?: string) {
    const threadId = parentThreadId || `t${Date.now()}`;
    const timestamp = Date.now();

    // 1. Create the email in the Sender's SENT folder
    const sentEmail: Email = {
      id: `e${Date.now()}_sent`,
      threadId,
      from: fromUser,
      to: toUsers,
      cc: [],
      bcc: [],
      subject,
      body,
      timestamp,
      isRead: true,
      isStarred: false,
      folder: FolderId.SENT
    };

    this.emails.push(sentEmail);

    // 2. Create copies for Recipients (Inbox)
    toUsers.forEach(recipient => {
      const inboxEmail: Email = {
        id: `e${Date.now()}_${recipient.id}`,
        threadId,
        from: fromUser,
        to: toUsers,
        cc: [],
        bcc: [],
        subject,
        body,
        timestamp,
        isRead: false,
        isStarred: false,
        folder: FolderId.INBOX // Default to inbox
      };
      this.emails.push(inboxEmail);
    });

    this.notify();
  }
  
  // New helper for Dual Mode: Get all emails between two specific users
  getConversation(userAId: string, userBId: string): Email[] {
      return this.emails.filter(e => {
          const fromA = e.from.id === userAId;
          const fromB = e.from.id === userBId;
          const toA = e.to.some(u => u.id === userAId);
          const toB = e.to.some(u => u.id === userBId);
          
          // Conversation = (From A AND To B) OR (From B AND To A)
          // Fix: Only take the 'SENT' copy to avoid duplicates (since we create a copy for inbox and sent)
          return ((fromA && toB) || (fromB && toA)) && e.folder === FolderId.SENT;
      }).sort((a, b) => a.timestamp - b.timestamp);
  }

  getStats() {
    return {
        totalEmails: this.emails.length,
        totalThreads: new Set(this.emails.map(e => e.threadId)).size,
        users: this.users.length
    }
  }
}

export const mailStore = new MailStore();