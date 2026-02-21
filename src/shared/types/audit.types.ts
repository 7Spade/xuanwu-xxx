import type { Timestamp } from 'firebase/firestore'

export interface AuditLog {
  id: string;
  accountId: string;
  workspaceId?: string;
  workspaceName?: string;
  recordedAt: Timestamp; // Event Timestamp
  actor: string;
  actorId?: string;
  action: string;
  target: string;
  type: 'create' | 'update' | 'delete' | 'security';
  metadata?: {
    before?: unknown;
    after?: unknown;
    ip?: string;
  };
}
