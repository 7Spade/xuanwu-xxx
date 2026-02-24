/**
 * @fileoverview workspace-business.files — Real-time Firestore subscription.
 *
 * Provides a reactive subscription to the `files` subcollection so that
 * `WorkspaceFiles` components reflect uploads and version updates instantly
 * without relying on the workspace document's optional `files` map field.
 *
 * Path: workspaces/{workspaceId}/files/{fileId}
 */

import { collection, query, orderBy, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import type { WorkspaceFile } from '@/shared/types';

/**
 * Opens a real-time listener on the workspace files subcollection.
 * Calls `onUpdate` with the sorted file list on every change.
 *
 * @param workspaceId The workspace whose files to subscribe to.
 * @param onUpdate    Callback receiving the latest file array on every update.
 * @returns An unsubscribe function — call it on component unmount.
 */
export function subscribeToWorkspaceFiles(
  workspaceId: string,
  onUpdate: (files: WorkspaceFile[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'workspaces', workspaceId, 'files'),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const files = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }) as WorkspaceFile);
    onUpdate(files);
  });
}
