import { User, UserRole, Email, FolderId } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Jean Dupont',
    email: 'jean.dupont@interac.local',
    role: UserRole.USER,
    avatar: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'u2',
    name: 'Sophie Martin',
    email: 'sophie.martin@interac.local',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'u3',
    name: 'Interac Security',
    email: 'security@interac.local',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: 'u4',
    name: 'Marketing Team',
    email: 'marketing@interac.local',
    role: UserRole.USER,
    avatar: 'https://picsum.photos/200/200?random=4'
  }
];

export const CURRENT_USER_ID = 'u1'; // Default logged in as Jean

const now = Date.now();
const hour = 3600 * 1000;
const day = 24 * hour;

// Generate some initial emails
export const INITIAL_EMAILS: Email[] = [
  {
    id: 'e1',
    threadId: 't1',
    from: MOCK_USERS[1], // Sophie
    to: [MOCK_USERS[0]], // Jean
    cc: [],
    bcc: [],
    subject: 'Mise à jour du projet Alpha',
    body: '<p>Bonjour Jean,</p><p>Peux-tu me faire un retour sur les derniers maquettes ?</p><p>Cordialement,<br>Sophie</p>',
    timestamp: now - 2 * hour,
    isRead: false,
    isStarred: true,
    folder: FolderId.INBOX
  },
  {
    id: 'e2',
    threadId: 't1',
    from: MOCK_USERS[0], // Jean
    to: [MOCK_USERS[1]], // Sophie
    cc: [],
    bcc: [],
    subject: 'Mise à jour du projet Alpha',
    body: '<p>Salut Sophie,</p><p>C\'est noté, je regarde ça avant midi.</p>',
    timestamp: now - 1 * hour,
    isRead: true,
    isStarred: false,
    folder: FolderId.SENT
  },
  {
    id: 'e3',
    threadId: 't2',
    from: MOCK_USERS[2], // Security
    to: [MOCK_USERS[0]], // Jean
    cc: [],
    bcc: [],
    subject: 'Alerte Phishing - Important',
    body: '<p>Attention à tous,</p><p>Nous avons détecté une vague de mails frauduleux.</p>',
    timestamp: now - 1 * day,
    isRead: true,
    isStarred: false,
    folder: FolderId.INBOX
  },
  {
    id: 'e4',
    threadId: 't3',
    from: MOCK_USERS[3], // Marketing
    to: [MOCK_USERS[0]], // Jean
    cc: [],
    bcc: [],
    subject: 'Newsletter Interne - Juin',
    body: '<p>Découvrez les nouveautés du mois !</p>',
    timestamp: now - 3 * day,
    isRead: true,
    isStarred: false,
    folder: FolderId.SPAM
  }
];