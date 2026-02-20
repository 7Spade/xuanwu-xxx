export interface AuditLog {
  id: string;
  accountId: string;
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
