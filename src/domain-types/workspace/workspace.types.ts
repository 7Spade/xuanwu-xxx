export type WorkspaceRole = 'Manager' | 'Contributor' | 'Viewer';
export type WorkspaceLifecycleState = 'preparatory' | 'active' | 'stopped';

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
  address?: Address; // The physical address of the entire workspace.
  createdAt: any; // FirestoreTimestamp
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

// Workspace sub-collection types — all stored under workspaces/{id}/...

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
