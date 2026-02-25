/**
 * projection.workspace-scope-guard — _queries.ts
 *
 * Read-side queries for the scope guard read model.
 * Used exclusively by workspace-application/_scope-guard.ts.
 */

import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { WorkspaceScopeGuardView } from './_read-model';
import { buildAuthoritySnapshot } from './_read-model';
import type { AuthoritySnapshot } from '@/shared-kernel/identity/authority-snapshot';

/**
 * Fetches the scope guard read model for a workspace.
 * Returns null if not yet projected (caller should fall back to direct read).
 */
export async function getScopeGuardView(
  workspaceId: string
): Promise<WorkspaceScopeGuardView | null> {
  return getDocument<WorkspaceScopeGuardView>(`scopeGuardView/${workspaceId}`);
}

/**
 * Checks workspace access by querying the scope guard read model.
 * Returns the authority snapshot on success, or null if access denied.
 */
export async function queryWorkspaceAccess(
  workspaceId: string,
  userId: string
): Promise<{ allowed: boolean; role?: string; snapshot?: AuthoritySnapshot }> {
  const view = await getScopeGuardView(workspaceId);
  if (!view) return { allowed: false };

  const isOwner = view.ownerId === userId;
  const grant = view.grantIndex[userId];

  if (!isOwner && grant?.status !== 'active') {
    return { allowed: false };
  }

  const snapshot = buildAuthoritySnapshot(view, userId);
  const role = isOwner ? 'Manager' : grant.role;
  return { allowed: true, role, snapshot };
}
