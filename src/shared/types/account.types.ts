import type { SkillGrant } from './skill.types'
import type { Timestamp } from 'firebase/firestore'

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
  /**
   * Individual skill grants — permanently attached to this user.
   * Only meaningful on `accountType === 'user'` accounts.
   * Survives org/team deletion; matched by `tagSlug` against the global
   * static library in shared/constants/skills.ts.
   */
  skillGrants?: SkillGrant[]
  /**
   * Wallet — pre-embedded for future currency/reward system.
   * Only meaningful on `accountType === 'user'` accounts.
   * Balance is the authoritative figure; full transaction history lives in
   * the `accounts/{userId}/walletTransactions` sub-collection when needed.
   */
  wallet?: Wallet
  // org-specific
  description?: string
  ownerId?: string
  role?: OrganizationRole   // current user's role in this org
  theme?: ThemeConfig
  members?: MemberReference[]
  memberIds?: string[]
  teams?: Team[]
  createdAt?: Timestamp
}

export interface MemberReference {
  id: string;
  name: string;
  email: string;
  role: OrganizationRole;
  presence: 'active' | 'away' | 'offline';
  isExternal?: boolean;
  expiryDate?: Timestamp; // FirestoreTimestamp
  /**
   * Display cache of this individual's skill grants.
   * Derived from accounts/{id}.skillGrants at read time — not the source of truth.
   * Do not write XP here; write to accounts/{userId}.skillGrants instead.
   */
  skillGrants?: SkillGrant[];
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

/**
 * User wallet — inline balance summary stored on the user account document.
 *
 * Design contract:
 *   - `balance` is always the authoritative total (never negative).
 *   - Detailed transaction history goes in `accounts/{userId}/walletTransactions`
 *     sub-collection when that feature is built — this struct stays as the
 *     fast-read summary that loads with the profile in a single document fetch.
 *   - Extend this struct with optional fields (e.g. `currency`, `pendingBalance`)
 *     as needed — no migration required since all fields are optional beyond `balance`.
 */
export interface Wallet {
  /** Current coin balance. Incremented by XP rewards, decremented by spending. */
  balance: number;
}

/** @deprecated Use SkillDefinition from shared/constants/skills for new code. */
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
  invitedAt: Timestamp; // Event Timestamp
  protocol: string;
}
