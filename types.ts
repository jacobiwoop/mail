export enum FolderId {
  INBOX = 'inbox',
  SENT = 'sent',
  DRAFTS = 'drafts',
  SPAM = 'spam',
  TRASH = 'trash',
  ARCHIVE = 'archive',
  ADMIN_ALL = 'admin_all', // Admin only view
  ADMIN_USERS = 'admin_users',
  DUAL_MODE = 'dual_mode'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface AppSettings {
  appName: string;
  logoUrl: string; // URL to the logo image
}

export interface User {
  id: string;
  name: string;
  email: string; // e.g., prenom.nom@interac.local
  role: UserRole;
  avatar?: string;
  isCertified?: boolean;
}

export interface Email {
  id: string;
  threadId: string;
  from: User;
  to: User[];
  cc: User[];
  bcc: User[];
  subject: string;
  body: string; // HTML-like string or plain text
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
  folder: FolderId; // Which folder does this specific instance belong to?
  attachments?: string[];
}

export interface Thread {
  id: string;
  subject: string;
  messages: Email[];
  lastTimestamp: number;
  hasUnread: boolean;
  participants: User[];
}

export interface AppState {
  currentUser: User;
  selectedFolder: FolderId;
  selectedThreadId: string | null;
  isComposeOpen: boolean;
  searchQuery: string;
}