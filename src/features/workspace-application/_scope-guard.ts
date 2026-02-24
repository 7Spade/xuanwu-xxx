/**
 * workspace-application/_scope-guard.ts
 *
 * Validates workspace access for a given caller.
 *
 * Per logic-overview.v3.md invariant #7:
 * Scope Guard reads ONLY local read model — never directly from external event buses.
 *
 * Current implementation: reads workspace grants document directly.
 * Future: switch to projection.workspace-scope-guard read model when available.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import type { Workspace } from '@/shared/types';

export interface ScopeGuardResult {
  allowed: boolean;
  role?: string;
  reason?: string;
}

/**
 * Checks whether a user has active access to a workspace.
 * Reads workspace document grants (pre-projection fallback).
 *
 * Returns { allowed: true, role } on success, or { allowed: false, reason } on denial.
 */
export async function checkWorkspaceAccess(
  workspaceId: string,
  userId: string
): Promise<ScopeGuardResult> {
  const wsRef = doc(db, 'workspaces', workspaceId);
  const snap = await getDoc(wsRef);

  if (!snap.exists()) {
    return { allowed: false, reason: 'Workspace not found' };
  }

  const workspace = snap.data() as Workspace;

  // Workspace owner (dimensionId) always has Manager access
  if (workspace.dimensionId === userId) {
    return { allowed: true, role: 'Manager' };
  }

  // Check active grants
  const grant = workspace.grants?.find(
    (g) => g.userId === userId && g.status === 'active'
  );

  if (grant) {
    return { allowed: true, role: grant.role };
  }

  return { allowed: false, reason: 'No active workspace grant for this user' };
}
