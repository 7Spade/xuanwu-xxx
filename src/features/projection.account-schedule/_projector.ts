/**
 * projection.account-schedule — _projector.ts
 *
 * Maintains the account schedule projection.
 * Used by workspace-business.schedule to filter available accounts.
 *
 * Stored at: scheduleProjection/{accountId}/assignments/{assignmentId}
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_SCHEDULE
 *   W_B_SCHEDULE -.→ ACCOUNT_PROJECTION_SCHEDULE (過濾可用帳號)
 */

import { serverTimestamp, arrayUnion, arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { setDocument } from '@/shared/infra/firestore/firestore.write.adapter';

export interface AccountScheduleProjection {
  accountId: string;
  /** Active schedule assignment IDs */
  activeAssignmentIds: string[];
  /** Map of scheduleItemId → { workspaceId, startDate, endDate } */
  assignmentIndex: Record<string, AccountScheduleAssignment>;
  readModelVersion: number;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

export interface AccountScheduleAssignment {
  scheduleItemId: string;
  workspaceId: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

/**
 * Initialises or resets the schedule projection for an account.
 */
export async function initAccountScheduleProjection(accountId: string): Promise<void> {
  await setDocument(`scheduleProjection/${accountId}`, {
    accountId,
    activeAssignmentIds: [],
    assignmentIndex: {},
    readModelVersion: 1,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Adds a schedule assignment to the projection.
 * Updates both `assignmentIndex` (for detail lookups) and `activeAssignmentIds`
 * (for fast availability filtering).
 */
export async function applyScheduleAssigned(
  accountId: string,
  assignment: AccountScheduleAssignment
): Promise<void> {
  const docRef = doc(db, `scheduleProjection/${accountId}`);
  await updateDoc(docRef, {
    [`assignmentIndex.${assignment.scheduleItemId}`]: assignment,
    activeAssignmentIds: arrayUnion(assignment.scheduleItemId),
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Marks a schedule assignment as completed in the projection.
 * Removes from `activeAssignmentIds` so availability filters exclude it.
 */
export async function applyScheduleCompleted(
  accountId: string,
  scheduleItemId: string
): Promise<void> {
  const docRef = doc(db, `scheduleProjection/${accountId}`);
  await updateDoc(docRef, {
    [`assignmentIndex.${scheduleItemId}.status`]: 'completed',
    activeAssignmentIds: arrayRemove(scheduleItemId),
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  });
}
