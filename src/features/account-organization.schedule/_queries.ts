/**
 * account-organization.schedule — _queries.ts
 *
 * Read queries for the org schedule proposal read model.
 * Stored at: orgScheduleProposals/{scheduleItemId}
 *
 * Per logic-overview.v3.md:
 *   WORKSPACE_OUTBOX → ORGANIZATION_SCHEDULE (writes proposals)
 *   ORGANIZATION_SCHEDULE → (queries expose proposals for org governance UI)
 *
 * Invariant #2: reads only this BC's own Firestore collection.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { OrgScheduleProposal, OrgScheduleStatus } from './_schedule';

/**
 * Fetches a single org schedule proposal by scheduleItemId.
 */
export async function getOrgScheduleProposal(
  scheduleItemId: string
): Promise<OrgScheduleProposal | null> {
  return getDocument<OrgScheduleProposal>(`orgScheduleProposals/${scheduleItemId}`);
}

/**
 * Subscribes to org schedule proposals for a given orgId, optionally filtered by status.
 * Returns an unsubscribe function.
 *
 * Primary consumer: org governance UI (approve/reject pending proposals).
 */
export function subscribeToOrgScheduleProposals(
  orgId: string,
  onUpdate: (proposals: OrgScheduleProposal[]) => void,
  opts?: {
    status?: OrgScheduleStatus;
    maxItems?: number;
  }
): Unsubscribe {
  const ref = collection(db, 'orgScheduleProposals');

  const constraints: Parameters<typeof query>[1][] = [
    where('orgId', '==', orgId),
    orderBy('receivedAt', 'desc'),
  ];
  if (opts?.status) {
    constraints.push(where('status', '==', opts.status));
  }
  if (opts?.maxItems) {
    constraints.push(limit(opts.maxItems));
  }

  const q = query(ref, ...constraints);

  return onSnapshot(q, (snap) => {
    const proposals = snap.docs.map((d) => ({
      ...d.data(),
    } as OrgScheduleProposal));
    onUpdate(proposals);
  });
}

/**
 * Subscribes to pending proposals only (status = 'proposed').
 * Convenience wrapper for the governance approval UI.
 */
export function subscribeToPendingProposals(
  orgId: string,
  onUpdate: (proposals: OrgScheduleProposal[]) => void
): Unsubscribe {
  return subscribeToOrgScheduleProposals(orgId, onUpdate, { status: 'proposed' });
}
