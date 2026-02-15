// =================================================================
// == Primitive Types & Enums
// =================================================================

export type OrganizationRole = 'Owner' | 'Admin' | 'Member' | 'Guest';
export type WorkspaceRole = 'Manager' | 'Contributor' | 'Viewer';
export type WorkspaceLifecycleState = 'preparatory' | 'active' | 'stopped';
export type ScheduleStatus = 'PROPOSAL' | 'OFFICIAL' | 'REJECTED';

// =================================================================
// == Core Business Entities
// =================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export interface UserProfile {
  id: string;
  bio?: string;
  photoURL?: string;
  achievements?: string[];
  expertiseBadges?: ExpertiseBadge[];
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  role: OrganizationRole;
  theme?: ThemeConfig;
  members: MemberReference[];
  memberIds: string[]; // Derived field for security rules
  teams: Team[];
  createdAt: any; // FirestoreTimestamp
}

export interface Workspace {
  id: string;
  dimensionId: string; // The ID of the User or Organization this workspace belongs to.
  name: string;
  lifecycleState: WorkspaceLifecycleState;
  visibility: 'visible' | 'hidden';
  scope: string[];
  protocol: string; // Default protocol template
  capabilities: Capability[];
  grants: WorkspaceGrant[];
  teamIds: string[];
  tasks?: Record<string, WorkspaceTask>;
  issues?: Record<string, WorkspaceIssue>;
  files?: Record<string, WorkspaceFile>;
  schedule?: Record<string, ScheduleItem>;
  address?: Address; // The physical address of the entire workspace.
  createdAt: any; // FirestoreTimestamp
}

// =================================================================
// == Relational & Structural Types
// =================================================================

export interface SwitchableAccount {
  id: string;
  name: string;
  type: 'user' | 'organization';
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

export interface WorkspaceGrant {
  grantId: string;
  userId: string;
  role: WorkspaceRole;
  protocol: string; // Strategy Definition, immutable
  status: 'active' | 'revoked' | 'expired';
  grantedAt: any; // Event Timestamp
  revokedAt?: any; // Event Timestamp
  expiresAt?: any; // State Boundary
}

export interface CapabilitySpec {
  id: string;
  name: string;
  type: 'ui' | 'api' | 'data' | 'governance' | 'monitoring';
  status: 'stable' | 'beta';
  description: string;
}

export interface Capability extends CapabilitySpec {
  config?: object;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  details?: string;
}

export interface Location {
  building?: string; // 棟
  floor?: string;    // 樓
  room?: string;     // 室
  description: string; // 一個自由文本欄位，用於描述更精確的位置，如 "主會議室" 或 "東北角機房"
}

// =================================================================
// == Feature & Capability Entities
// =================================================================

// Task Management
export interface WorkspaceTask {
  id: string;
  name: string;
  description?: string;
  progressState: 'todo' | 'doing' | 'completed' | 'verified' | 'accepted';
  priority: 'low' | 'medium' | 'high';
  type?: string;
  progress?: number;
  quantity?: number;
  completedQuantity?: number;
  unitPrice?: number;
  unit?: string;
  discount?: number;
  subtotal: number;
  parentId?: string;
  assigneeId?: string;
  dueDate?: any; // Firestore Timestamp
  photoURLs?: string[];
  location?: Location; // The specific place within the workspace address.
  createdAt: any; // FirestoreTimestamp
  updatedAt?: any; // FirestoreTimestamp
  [key: string]: any;
}

export interface IssueComment {
  id: string;
  author: string;
  content: string;
  createdAt: any; // Firestore Timestamp
}

export interface WorkspaceIssue {
  id: string;
  title: string;
  type: 'technical' | 'financial';
  priority: 'high' | 'medium';
  issueState: 'open' | 'closed';
  createdAt: any; // FirestoreTimestamp
  comments?: IssueComment[];
}

// File Management
export interface WorkspaceFileVersion {
  versionId: string;
  versionNumber: number;
  versionName: string;
  size: number;
  uploadedBy: string;
  createdAt: any; // Can be Date for client-side, becomes Timestamp on server
  downloadURL: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  type: string;
  currentVersionId: string;
  updatedAt: any; // Can be Date for client-side, becomes Timestamp on server
  versions: WorkspaceFileVersion[];
}

// Scheduling
export interface ScheduleItem {
  id: string;
  accountId: string; // The owning Organization ID
  workspaceId: string;
  workspaceName?: string;
  title: string;
  description?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
  startDate: any; // Firestore Timestamp
  endDate: any; // Firestore Timestamp
  status: ScheduleStatus;
  originType: 'MANUAL' | 'TASK_AUTOMATION';
  originTaskId?: string;
  assigneeIds: string[];
  location?: Location;
}

// Logging
export interface DailyLogComment {
  id: string;
  author: {
    uid: string;
    name: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: any; // Firestore Timestamp
}

export interface DailyLog {
  id: string;
  accountId: string;
  workspaceId: string;
  workspaceName: string;
  author: {
    uid: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  photoURLs: string[];
  recordedAt: any; // The actual time the event happened, editable by user
  createdAt: any; // The system time the log was created
  likes?: string[]; // Array of user IDs who liked the log
  likeCount?: number; // Denormalized count of likes
  commentCount?: number; // Denormalized count of comments
  comments?: DailyLogComment[]; // Locally held comments, not persisted
}

export interface AuditLog {
  id: string;
  orgId: string;
  workspaceId?: string;
  recordedAt: any; // Event Timestamp
  actor: string;
  actorId?: string;
  action: string;
  target: string;
  type: 'create' | 'update' | 'delete' | 'security';
  metadata?: {
    before?: any;
    after?: any;
    ip?: string;
  };
}

// =================================================================
// == Accessory & UI-Related Types
// =================================================================

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

export interface UserCollection {
  id: string;
  name: string;
  description?: string;
  logIds: string[];
  createdAt: any; // Firestore Timestamp
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
