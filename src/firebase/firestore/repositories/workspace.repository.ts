/**
 * @fileoverview Workspace Repository.
 *
 * All Firestore read and write operations for the `workspaces` collection
 * and its sub-collections (tasks, issues, files, grants).
 */

import {
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firestore.client';
import {
  updateDocument,
  addDocument,
  deleteDocument,
} from '../firestore.write.adapter';
import { getDocuments } from '../firestore.read.adapter';
import { createConverter } from '../firestore.converter';
import type {
  Workspace,
  WorkspaceRole,
  WorkspaceGrant,
  WorkspaceIssue,
  IssueComment,
  WorkspaceTask,
  WorkspaceFile,
  Capability,
  WorkspaceLifecycleState,
} from '@/domain-types/workspace'
import type { Account } from '@/domain-types/account'

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
  const workspaceData: Omit<Workspace, 'id'> = {
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
  }

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

    const newGrant: WorkspaceGrant = {
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

// =================================================================
// == Workspace Aggregate Reads
// =================================================================

export const getWorkspaceTasks = async (
  workspaceId: string
): Promise<WorkspaceTask[]> => {
  const converter = createConverter<WorkspaceTask>()
  const colRef = collection(
    db,
    `workspaces/${workspaceId}/tasks`
  ).withConverter(converter)
  const q = query(colRef, orderBy('createdAt', 'desc'))
  return getDocuments(q)
}

export const getWorkspaceIssues = async (
  workspaceId: string
): Promise<WorkspaceIssue[]> => {
  const converter = createConverter<WorkspaceIssue>()
  const colRef = collection(
    db,
    `workspaces/${workspaceId}/issues`
  ).withConverter(converter)
  const q = query(colRef, orderBy('createdAt', 'desc'))
  return getDocuments(q)
}

export const getWorkspaceFiles = async (
  workspaceId: string
): Promise<WorkspaceFile[]> => {
  const wsRef = doc(db, 'workspaces', workspaceId)
  const snap = await getDoc(wsRef)
  if (!snap.exists()) return []
  const data = snap.data() as Workspace
  return Object.values(data.files ?? {})
}

export const getWorkspaceGrants = async (
  workspaceId: string
): Promise<WorkspaceGrant[]> => {
  const wsRef = doc(db, 'workspaces', workspaceId)
  const snap = await getDoc(wsRef)
  if (!snap.exists()) return []
  const data = snap.data() as Workspace
  return data.grants ?? []
}
