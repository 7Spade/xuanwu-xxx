/**
 * @fileoverview Workspace Core Repository.
 *
 * Firestore read and write operations for the `workspaces` top-level collection:
 * workspace lifecycle, settings, capability management, member grants, and team access.
 * Corresponds to the `workspace-core` feature slice.
 */

import {
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  runTransaction,
  type FieldValue,
} from 'firebase/firestore';
import { db } from '../firestore.client';
import {
  updateDocument,
  addDocument,
  deleteDocument,
} from '../firestore.write.adapter';
import type {
  Workspace,
  WorkspaceRole,
  WorkspaceGrant,
  WorkspaceFile,
  Capability,
  WorkspaceLifecycleState,
  Account,
} from '@/shared/types';

/**
 * Creates a new workspace with default values, based on the active account context.
 * @param name The name of the new workspace.
 * @param account The active account (user or organization) creating the workspace.
 * @returns The ID of the newly created workspace.
 */
export const createWorkspace = async (
  name: string,
  account: Account
): Promise<string> => {
  const workspaceData: Omit<Workspace, 'id' | 'createdAt'> & { createdAt: FieldValue } = {
    name: name.trim(),
    dimensionId: account.id, // The single source of truth for ownership.
    lifecycleState: 'preparatory',
    visibility: account.accountType === 'organization' ? 'visible' : 'hidden',
    protocol: 'Standard Access Protocol',
    scope: ['Authentication', 'Compute'],
    capabilities: [],
    grants: [],
    teamIds: [],
    createdAt: serverTimestamp(),
  };

  const docRef = await addDocument('workspaces', workspaceData);
  return docRef.id;
};

/**
 * Authorizes a team to access a workspace.
 * @param workspaceId The ID of the workspace.
 * @param teamId The ID of the team to authorize.
 */
export const authorizeWorkspaceTeam = async (
  workspaceId: string,
  teamId: string
): Promise<void> => {
  const updates = { teamIds: arrayUnion(teamId) };
  return updateDocument(`workspaces/${workspaceId}`, updates);
};

/**
 * Revokes a team's access from a workspace.
 * @param workspaceId The ID of the workspace.
 * @param teamId The ID of the team to revoke.
 */
export const revokeWorkspaceTeam = async (
  workspaceId: string,
  teamId: string
): Promise<void> => {
  const updates = { teamIds: arrayRemove(teamId) };
  return updateDocument(`workspaces/${workspaceId}`, updates);
};

/**
 * Grants an individual member a specific role in a workspace.
 * Uses a transaction to atomically guard against duplicate active grants.
 * @param workspaceId The ID of the workspace.
 * @param userId The ID of the user to grant access to.
 * @param role The role to grant.
 * @param protocol The access protocol to apply.
 */
export const grantIndividualWorkspaceAccess = async (
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
  protocol?: string
): Promise<void> => {
  const wsRef = doc(db, 'workspaces', workspaceId);
  return runTransaction(db, async (transaction) => {
    const wsSnap = await transaction.get(wsRef);
    if (!wsSnap.exists()) throw new Error('Workspace not found');

    const data = wsSnap.data() as Workspace;
    const grants = data.grants || [];
    const hasActiveGrant = grants.some(
      (g) => g.userId === userId && g.status === 'active'
    );
    if (hasActiveGrant) {
      throw new Error('User already has an active grant for this workspace.');
    }

    const newGrant: Omit<WorkspaceGrant, 'grantedAt'> & { grantedAt: FieldValue } = {
      grantId: crypto.randomUUID(),
      userId,
      role,
      protocol: protocol || 'Standard Bridge',
      status: 'active',
      grantedAt: serverTimestamp(),
    };
    transaction.update(wsRef, { grants: arrayUnion(newGrant) });
  });
};

/**
 * Revokes an individual's direct access grant from a workspace.
 * Uses a transaction to atomically read-modify-write the grants array.
 * @param workspaceId The ID of the workspace.
 * @param grantId The ID of the grant to revoke.
 */
export const revokeIndividualWorkspaceAccess = async (
  workspaceId: string,
  grantId: string
): Promise<void> => {
  const wsRef = doc(db, 'workspaces', workspaceId);
  return runTransaction(db, async (transaction) => {
    const wsSnap = await transaction.get(wsRef);
    if (!wsSnap.exists()) throw new Error('Workspace not found');

    const data = wsSnap.data() as Workspace;
    const grants = data.grants || [];
    const updatedGrants = grants.map((g) =>
      g.grantId === grantId
        ? { ...g, status: 'revoked' as const, revokedAt: serverTimestamp() }
        : g
    );
    transaction.update(wsRef, { grants: updatedGrants });
  });
};

/**
 * Mounts (adds) capabilities to a workspace.
 * @param workspaceId The ID of the workspace.
 * @param capabilities An array of capability objects to mount.
 */
export const mountCapabilities = async (
  workspaceId: string,
  capabilities: Capability[]
): Promise<void> => {
  const updates = { capabilities: arrayUnion(...capabilities) };
  return updateDocument(`workspaces/${workspaceId}`, updates);
};

/**
 * Unmounts (removes) a capability from a workspace.
 * Uses a transaction with filter-by-id to avoid fragile deep-equality matching.
 * @param workspaceId The ID of the workspace.
 * @param capability The capability object to unmount.
 */
export const unmountCapability = async (
  workspaceId: string,
  capability: Capability
): Promise<void> => {
  const wsRef = doc(db, 'workspaces', workspaceId);
  return runTransaction(db, async (transaction) => {
    const wsSnap = await transaction.get(wsRef);
    if (!wsSnap.exists()) throw new Error('Workspace not found');

    const data = wsSnap.data() as Workspace;
    const updated = (data.capabilities || []).filter((c) => c.id !== capability.id);
    transaction.update(wsRef, { capabilities: updated });
  });
};

/**
 * Updates the settings of a workspace.
 * @param workspaceId The ID of the workspace.
 * @param settings The settings to update.
 */
export const updateWorkspaceSettings = async (
  workspaceId: string,
  settings: {
    name: string;
    visibility: 'visible' | 'hidden';
    lifecycleState: WorkspaceLifecycleState;
  }
): Promise<void> => {
  return updateDocument(`workspaces/${workspaceId}`, settings);
};

/**
 * Deletes an entire workspace.
 * @param workspaceId The ID of the workspace to delete.
 */
export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  // This just deletes the doc. In a real app, we'd need a Cloud Function
  // to delete all subcollections (tasks, issues, etc.).
  return deleteDocument(`workspaces/${workspaceId}`);
};

export const getWorkspaceFiles = async (
  workspaceId: string
): Promise<WorkspaceFile[]> => {
  const wsRef = doc(db, 'workspaces', workspaceId);
  const snap = await getDoc(wsRef);
  if (!snap.exists()) return [];
  const data = snap.data() as Workspace;
  return Object.values(data.files ?? {});
};

export const getWorkspaceGrants = async (
  workspaceId: string
): Promise<WorkspaceGrant[]> => {
  const wsRef = doc(db, 'workspaces', workspaceId);
  const snap = await getDoc(wsRef);
  if (!snap.exists()) return [];
  const data = snap.data() as Workspace;
  return data.grants ?? [];
};
