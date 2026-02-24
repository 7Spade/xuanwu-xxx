/**
 * @fileoverview Workspace Business — Tasks Repository.
 *
 * All Firestore read and write operations for the `tasks` sub-collection
 * under a workspace. Stored at: workspaces/{workspaceId}/tasks/{taskId}
 * Corresponds to the `workspace-business.tasks` feature slice.
 */

import {
  serverTimestamp,
  collection,
  query,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firestore.client';
import {
  updateDocument,
  addDocument,
  deleteDocument,
} from '../firestore.write.adapter';
import { getDocuments } from '../firestore.read.adapter';
import { createConverter } from '../firestore.converter';
import type { WorkspaceTask } from '@/shared/types';

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

export const getWorkspaceTasks = async (
  workspaceId: string
): Promise<WorkspaceTask[]> => {
  const converter = createConverter<WorkspaceTask>();
  const colRef = collection(
    db,
    `workspaces/${workspaceId}/tasks`
  ).withConverter(converter);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return getDocuments(q);
};

export const getWorkspaceTask = async (
  workspaceId: string,
  taskId: string
): Promise<WorkspaceTask | null> => {
  const converter = createConverter<WorkspaceTask>();
  const docRef = doc(db, `workspaces/${workspaceId}/tasks/${taskId}`).withConverter(converter);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
};
