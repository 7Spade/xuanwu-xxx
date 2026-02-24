'use server';

/**
 * workspace-governance.role — _actions.ts
 *
 * Server actions for workspace-level role management.
 *
 * Per logic-overview.v3.md:
 *   WORKSPACE_ROLE — split from workspace-governance.members, workspace access control only.
 *   Does NOT sign CUSTOM_CLAIMS; that is account-governance.role's responsibility.
 *
 * Invariant #1: This BC only writes its own aggregate (workspace grants).
 */

import {
  grantIndividualWorkspaceAccess,
  revokeIndividualWorkspaceAccess,
} from '@/shared/infra/firestore/firestore.facade';
import type { WorkspaceRole } from '@/shared/types';

export interface AssignWorkspaceRoleInput {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  protocol?: string;
}

export interface RevokeWorkspaceRoleInput {
  workspaceId: string;
  userId: string;
}

/**
 * Assigns a workspace-level role to a user.
 * Delegates to the workspace core repository — atomic grant guard included.
 */
export async function assignWorkspaceRole(input: AssignWorkspaceRoleInput): Promise<void> {
  await grantIndividualWorkspaceAccess(
    input.workspaceId,
    input.userId,
    input.role,
    input.protocol
  );
}

/**
 * Revokes a workspace-level role from a user.
 */
export async function revokeWorkspaceRole(input: RevokeWorkspaceRoleInput): Promise<void> {
  await revokeIndividualWorkspaceAccess(input.workspaceId, input.userId);
}
