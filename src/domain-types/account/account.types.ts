export type AccountType = 'user' | 'organization'
export type OrganizationRole = 'Owner' | 'Admin' | 'Member' | 'Guest';

export interface Account {
  id: string
  name: string
  accountType: AccountType
  email?: string
  photoURL?: string
  bio?: string
  achievements?: string[]
  expertiseBadges?: ExpertiseBadge[]
  // org-specific
  description?: string
  ownerId?: string
  role?: OrganizationRole   // current user's role in this org
  theme?: ThemeConfig
  members?: MemberReference[]
  memberIds?: string[]
  teams?: Team[]
  createdAt?: any
}

export interface MemberReference {
  id: string;
  name: string;
  email: string;
  role: OrganizationRole;
  presence: 'active' | 'away' | 'offline';
  isExternal?: boolean;
  expiryDate?: any; // FirestoreTimestamp
}

export interface Team {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external';
  memberIds: string[];
}

export interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
}

export interface ExpertiseBadge {
  id: string;
  name: string;
  icon?: string; // e.g., a lucide-react icon name
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  read: boolean;
  timestamp: number;
}

export interface PartnerInvite {
  id: string;
  email: string;
  teamId: string;
  role: OrganizationRole;
  inviteState: 'pending' | 'accepted' | 'expired';
  invitedAt: any; // Event Timestamp
  protocol: string;
}
