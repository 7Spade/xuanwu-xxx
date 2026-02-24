export type WorkspaceRole = 'Manager' | 'Contributor' | 'Viewer';
export type WorkspaceLifecycleState = 'preparatory' | 'active' | 'stopped';

import type { Timestamp } from 'firebase/firestore'
import type { SkillRequirement } from './skill.types'

// =================================================================
// Brand Types — nominal type safety for cross-module references
// =================================================================

/** Branded ID for a ParsingIntent document — prevents mixing with plain strings. */
export type IntentID = string & { readonly _brand: 'IntentID' }

/** Branded pointer to a source file download URL — immutable contract anchor. */
export type SourcePointer = string & { readonly _brand: 'SourcePointer' }

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
  createdAt: Timestamp; // FirestoreTimestamp
}

export interface WorkspaceGrant {
  grantId: string;
  userId: string;
  role: WorkspaceRole;
  protocol: string; // Strategy Definition, immutable
  status: 'active' | 'revoked' | 'expired';
  grantedAt: Timestamp; // Event Timestamp
  revokedAt?: Timestamp; // Event Timestamp
  expiresAt?: Timestamp; // State Boundary
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
  progressState: 'todo' | 'doing' | 'blocked' | 'completed' | 'verified' | 'accepted';
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
  dueDate?: Timestamp; // Firestore Timestamp
  photoURLs?: string[];
  location?: Location; // The specific place within the workspace address.
  sourceIntentId?: string; // SourcePointer —唯讀引用 ParsingIntent（Digital Twin）
  createdAt: Timestamp; // FirestoreTimestamp
  updatedAt?: Timestamp; // FirestoreTimestamp
  [key: string]: unknown;
}

export interface IssueComment {
  id: string;
  author: string;
  content: string;
  createdAt: Timestamp; // Firestore Timestamp
}

export interface WorkspaceIssue {
  id: string;
  title: string;
  type: 'technical' | 'financial';
  priority: 'high' | 'medium';
  issueState: 'open' | 'closed';
  /** SourcePointer to the A-track task that triggered this B-track issue. */
  sourceTaskId?: string;
  createdAt: Timestamp; // FirestoreTimestamp
  comments?: IssueComment[];
}

export interface WorkspaceFileVersion {
  versionId: string;
  versionNumber: number;
  versionName: string;
  size: number;
  uploadedBy: string;
  createdAt: Timestamp | Date; // Can be Date for client-side, becomes Timestamp on server
  downloadURL: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  type: string;
  currentVersionId: string;
  updatedAt: Timestamp | Date; // Can be Date for client-side, becomes Timestamp on server
  versions: WorkspaceFileVersion[];
}

// =================================================================
// ParsingIntent — Digital Twin 解析合約
// 由 workspace-business.document-parser 產出，唯讀合約供 tasks 引用
// =================================================================

export interface ParsedLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
}

export interface ParsingIntent {
  /** Branded ID — use `IntentID` cast when constructing references. */
  id: IntentID;
  workspaceId: string;
  sourceFileName: string;
  /** Immutable pointer to the original file in Firebase Storage. */
  sourceFileDownloadURL?: SourcePointer;
  /** Reference to the WorkspaceFile document that was parsed (for full traceability). */
  sourceFileId?: string;
  intentVersion: number;
  lineItems: ParsedLineItem[];
  /** Skill requirements extracted from the document — fed to organization.schedule proposals. */
  skillRequirements?: SkillRequirement[];
  status: 'pending' | 'imported' | 'failed';
  createdAt: Timestamp;
  importedAt?: Timestamp;
}
