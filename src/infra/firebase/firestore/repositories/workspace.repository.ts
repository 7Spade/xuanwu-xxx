/**
 * @fileoverview Workspace Repository.
 *
 * This file contains all Firestore write operations related to a single 'workspaces'
 * document and all of its sub-collections (tasks, issues, files, etc.).
 * It encapsulates the direct interactions with the Firebase SDK.
 */

import {
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
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
  SwitchableAccount,
  WorkspaceIssue,
  IssueComment,
  WorkspaceTask,
  Capability,
  WorkspaceLifecycleState,
} from '@/types/domain';

/**
 * Creates a new workspace with default values, based on the active account context.
 * @param name The name of the new workspace.
 * @param account The active account (user or organization) creating the workspace.
 * @returns The ID of the newly created workspace.
 */
export const createWorkspace = async (
  name: string,
  account: SwitchableAccount
): Promise<string> => {
  const workspaceData: Omit<Workspace, 'id'> = {
    name: name.trim(),
    dimensionId: account.id, // The single source of truth for ownership.
    lifecycleState: 'preparatory',
    visibility: account.type === 'organization' ? 'visible' : 'hidden',
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
  const newGrant: WorkspaceGrant = {
    grantId: `grant-${Math.random().toString(36).substring(2, 11)}`,
    userId: userId,
    role: role,
    protocol: protocol || 'Standard Bridge',
    status: 'active',
    grantedAt: serverTimestamp(),
  };
  const updates = { grants: arrayUnion(newGrant) };
  return updateDocument(`workspaces/${workspaceId}`, updates);
};

/**
 * Revokes an individual's direct access grant from a workspace.
 * @param workspaceId The ID of the workspace.
 * @param grantId The ID of the grant to revoke.
 */
export const revokeIndividualWorkspaceAccess = async (
  workspaceId: string,
  grantId: string
): Promise<void> => {
  const wsRef = doc(db, 'workspaces', workspaceId);
  const wsSnap = await getDoc(wsRef);

  if (!wsSnap.exists()) {
    throw new Error('Workspace not found');
  }

  const workspace = wsSnap.data() as Workspace;
  const grants = workspace.grants || [];
  const updatedGrants = grants.map((g) =>
    g.grantId === grantId
      ? { ...g, status: 'revoked', revokedAt: serverTimestamp() }
      : g
  );

  return updateDocument(`workspaces/${workspaceId}`, { grants: updatedGrants });
};

/**
 * Creates a new issue in a workspace (e.g., when a task is rejected).
 */
export const createIssue = async (
  workspaceId: string,
  title: string,
  type: 'technical' | 'financial',
  priority: 'high' | 'medium'
): Promise<void> => {
  const issueData: Omit<WorkspaceIssue, 'id'> = {
    title,
    type,
    priority,
    issueState: 'open',
    createdAt: serverTimestamp(),
    comments: [],
  };
  await addDocument(`workspaces/${workspaceId}/issues`, issueData);
};

/**
 * Adds a comment to a specific issue.
 */
export const addCommentToIssue = async (
  workspaceId: string,
  issueId: string,
  author: string,
  content: string
): Promise<void> => {
  const newComment: IssueComment = {
    id: `comment-${Math.random().toString(36).substring(2, 11)}`,
    author,
    content,
    createdAt: serverTimestamp(),
  };

  await updateDocument(`workspaces/${workspaceId}/issues/${issueId}`, {
    comments: arrayUnion(newComment),
  });
};

/**
 * Creates a new task in a specific workspace.
 * @param workspaceId The ID of the workspace.
 * @param taskData The data for the new task.
 * @returns The ID of the newly created task.
 */
export const createTask = async (
  workspaceId: string,
  taskData: Omit<WorkspaceTask, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const dataWithTimestamp = {
    ...taskData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDocument(
    `workspaces/${workspaceId}/tasks`,
    dataWithTimestamp
  );
  return docRef.id;
};

/**
 * Updates an existing task in a workspace.
 * @param workspaceId The ID of the workspace.
 * @param taskId The ID of the task to update.
 * @param updates The fields to update on the task.
 */
export const updateTask = async (
  workspaceId: string,
  taskId: string,
  updates: Partial<WorkspaceTask>
): Promise<void> => {
  const dataWithTimestamp = {
    ...updates,
    updatedAt: serverTimestamp(),
  };
  return updateDocument(
    `workspaces/${workspaceId}/tasks/${taskId}`,
    dataWithTimestamp
  );
};

/**
 * Deletes a task from a workspace.
 * @param workspaceId The ID of the workspace.
 * @param taskId The ID of the task to delete.
 */
export const deleteTask = async (
  workspaceId: string,
  taskId: string
): Promise<void> => {
  return deleteDocument(`workspaces/${workspaceId}/tasks/${taskId}`);
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
 * @param workspaceId The ID of the workspace.
 * @param capability The capability object to unmount.
 */
export const unmountCapability = async (
  workspaceId: string,
  capability: Capability
): Promise<void> => {
  const updates = { capabilities: arrayRemove(capability) };
  return updateDocument(`workspaces/${workspaceId}`, updates);
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
