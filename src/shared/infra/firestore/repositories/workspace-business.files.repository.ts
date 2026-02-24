/**
 * @fileoverview Workspace Business — Files Repository.
 *
 * All Firestore read and write operations for the `files` sub-collection
 * under a workspace. Stored at: workspaces/{workspaceId}/files/{fileId}
 * Corresponds to the `workspace-business.files` feature slice.
 */

import {
  serverTimestamp,
  collection,
  query,
  orderBy,
  arrayUnion,
  type FieldValue,
} from 'firebase/firestore';
import { db } from '../firestore.client';
import { updateDocument, addDocument } from '../firestore.write.adapter';
import { getDocuments } from '../firestore.read.adapter';
import { createConverter } from '../firestore.converter';
import type { WorkspaceFile, WorkspaceFileVersion } from '@/shared/types';

/**
 * Creates a new file document in the workspace files subcollection.
 * @param workspaceId The ID of the workspace.
 * @param fileData The file metadata (without id or server-generated updatedAt).
 * @returns The ID of the newly created file document.
 */
export const createWorkspaceFile = async (
  workspaceId: string,
  fileData: Omit<WorkspaceFile, 'id' | 'updatedAt'> & { updatedAt: FieldValue }
): Promise<string> => {
  const ref = await addDocument(`workspaces/${workspaceId}/files`, fileData);
  return ref.id;
};

/**
 * Adds a new version to an existing workspace file and updates the currentVersionId.
 * Uses arrayUnion to atomically append the version without race conditions.
 * @param workspaceId The ID of the workspace.
 * @param fileId The ID of the file document.
 * @param version The new version to append.
 * @param currentVersionId The ID of the new version to mark as current.
 */
export const addWorkspaceFileVersion = async (
  workspaceId: string,
  fileId: string,
  version: WorkspaceFileVersion,
  currentVersionId: string
): Promise<void> => {
  return updateDocument(`workspaces/${workspaceId}/files/${fileId}`, {
    versions: arrayUnion(version),
    currentVersionId,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Restores a workspace file to a previous version by updating currentVersionId.
 * @param workspaceId The ID of the workspace.
 * @param fileId The ID of the file document.
 * @param versionId The versionId to restore as current.
 */
export const restoreWorkspaceFileVersion = async (
  workspaceId: string,
  fileId: string,
  versionId: string
): Promise<void> => {
  return updateDocument(`workspaces/${workspaceId}/files/${fileId}`, {
    currentVersionId: versionId,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Fetches all files for a workspace (one-time read).
 * @param workspaceId The ID of the workspace.
 */
export const getWorkspaceFilesFromSubcollection = async (
  workspaceId: string
): Promise<WorkspaceFile[]> => {
  const converter = createConverter<WorkspaceFile>();
  const colRef = collection(db, `workspaces/${workspaceId}/files`).withConverter(converter);
  const q = query(colRef, orderBy('updatedAt', 'desc'));
  return getDocuments(q);
};
