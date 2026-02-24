/**
 * projection.workspace-scope-guard — _projector.ts
 *
 * Applies workspace domain events to maintain the scope guard read model.
 * Called by the Event Funnel (EVENT_FUNNEL_INPUT) for workspace events.
 *
 * Stored at: scopeGuardView/{workspaceId}
 */

import { serverTimestamp } from 'firebase/firestore';
import { setDocument, updateDocument } from '@/shared/infra/firestore/firestore.write.adapter';
import type { WorkspaceScopeGuardView } from './_read-model';

/**
 * Initialises the scope guard read model for a new workspace.
 */
export async function initScopeGuardView(
  workspaceId: string,
  ownerId: string
): Promise<void> {
  const view: Omit<WorkspaceScopeGuardView, 'updatedAt'> & { updatedAt: ReturnType<typeof serverTimestamp> } = {
    implementsAuthoritySnapshot: true,
    workspaceId,
    ownerId,
    grantIndex: {},
    readModelVersion: 1,
    updatedAt: serverTimestamp(),
  };
  await setDocument(`scopeGuardView/${workspaceId}`, view);
}

/**
 * Applies a grant event to the scope guard read model.
 */
export async function applyGrantEvent(
  workspaceId: string,
  userId: string,
  role: string,
  status: 'active' | 'revoked'
): Promise<void> {
  await updateDocument(`scopeGuardView/${workspaceId}`, {
    [`grantIndex.${userId}`]: { role, status, snapshotAt: new Date().toISOString() },
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  });
}
