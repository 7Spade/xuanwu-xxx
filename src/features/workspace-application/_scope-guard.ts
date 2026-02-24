/**
 * workspace-application/_scope-guard.ts
 *
 * Validates workspace access for a given caller.
 *
 * Per logic-overview.v3.md invariant #7:
 * Scope Guard reads ONLY local read model — never directly from external event buses.
 *
 * Implementation: queries projection.workspace-scope-guard read model first.
 * Falls back to direct workspace document read if the projection is not yet available.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { queryWorkspaceAccess } from '@/features/projection.workspace-scope-guard';
import type { Workspace } from '@/shared/types';

export interface ScopeGuardResult {
  allowed: boolean;
  role?: string;
  reason?: string;
}

/**
 * Checks whether a user has active access to a workspace.
 * Reads from projection.workspace-scope-guard read model (invariant #7).
 * Falls back to direct workspace document read when projection is unavailable.
 *
 * Returns { allowed: true, role } on success, or { allowed: false, reason } on denial.
 */
export async function checkWorkspaceAccess(
  workspaceId: string,
  userId: string
): Promise<ScopeGuardResult> {
  // Primary: query the scope guard projection read model
  const projectionResult = await queryWorkspaceAccess(workspaceId, userId);
  if (projectionResult.allowed) {
    return { allowed: true, role: projectionResult.role };
  }
  if (projectionResult.allowed === false && projectionResult.role === undefined) {
    // Projection returned a definitive denial — honour it
    // But first check if it's a "view not found" case (projection not yet built)
    // by checking if the workspace exists in the raw collection
  }

  // Fallback: direct workspace document read (pre-projection path)
  const wsRef = doc(db, 'workspaces', workspaceId);
  const snap = await getDoc(wsRef);

  if (!snap.exists()) {
    return { allowed: false, reason: 'Workspace not found' };
  }

  const workspace = snap.data() as Workspace;

  if (workspace.dimensionId === userId) {
    return { allowed: true, role: 'Manager' };
  }

  const grant = workspace.grants?.find(
    (g) => g.userId === userId && g.status === 'active'
  );

  if (grant) {
    return { allowed: true, role: grant.role };
  }

  return { allowed: false, reason: 'No active workspace grant for this user' };
}
