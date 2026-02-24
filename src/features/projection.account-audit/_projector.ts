/**
 * projection.account-audit — _projector.ts
 *
 * Maintains the account audit projection.
 * Stored at: auditProjection/{accountId}/entries/{entryId}
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_AUDIT
 */

import { serverTimestamp } from 'firebase/firestore';
import { addDocument } from '@/shared/infra/firestore/firestore.write.adapter';

export interface AuditProjectionEntry {
  id: string;
  accountId: string;
  eventType: string;
  actorId: string;
  targetId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  occurredAt: ReturnType<typeof serverTimestamp>;
}

/**
 * Appends an audit event to the account audit projection.
 */
export async function appendAuditEntry(
  accountId: string,
  entry: Omit<AuditProjectionEntry, 'id' | 'occurredAt'>
): Promise<string> {
  const ref = await addDocument(`auditProjection/${accountId}/entries`, {
    ...entry,
    occurredAt: serverTimestamp(),
  });
  return ref.id;
}
