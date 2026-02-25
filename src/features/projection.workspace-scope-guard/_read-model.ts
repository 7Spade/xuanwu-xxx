/**
 * projection.workspace-scope-guard — _scope-guard-read-model.ts
 *
 * Firestore schema for the scope guard read model.
 * Stored at: scopeGuardView/{workspaceId}
 *
 * Invariant #7: Scope Guard reads ONLY this local read model.
 * Invariant #8: Implements shared-kernel.authority-snapshot contract.
 */

import type { Timestamp } from 'firebase/firestore';
import type { AuthoritySnapshot } from '@/shared-kernel/identity/authority-snapshot';

export interface WorkspaceScopeGuardView {
  readonly implementsAuthoritySnapshot: true;
  workspaceId: string;
  ownerId: string;
  /** Map of userId → { role, status, snapshotAt } */
  grantIndex: Record<string, WorkspaceScopeGrantEntry>;
  /** Latest version processed from event stream */
  readModelVersion: number;
  updatedAt: Timestamp;
}

export interface WorkspaceScopeGrantEntry {
  role: string;
  status: 'active' | 'revoked';
  snapshotAt: string;
}

/**
 * Build an AuthoritySnapshot for a specific user from the read model.
 */
export function buildAuthoritySnapshot(
  view: WorkspaceScopeGuardView,
  userId: string
): AuthoritySnapshot {
  const isOwner = view.ownerId === userId;
  const grant = view.grantIndex[userId];
  const roles: string[] = [];

  if (isOwner) roles.push('Manager');
  else if (grant?.status === 'active') roles.push(grant.role);

  const permissions = derivePermissions(roles);

  return {
    subjectId: userId,
    roles,
    permissions,
    snapshotAt: new Date().toISOString(),
    readModelVersion: view.readModelVersion,
  };
}

function derivePermissions(roles: string[]): string[] {
  const permMap: Record<string, string[]> = {
    Manager: ['read', 'write', 'delete', 'manage', 'invite'],
    Admin: ['read', 'write', 'delete', 'invite'],
    Member: ['read', 'write'],
    Viewer: ['read'],
  };
  return [...new Set(roles.flatMap((r) => permMap[r] ?? ['read']))];
}
