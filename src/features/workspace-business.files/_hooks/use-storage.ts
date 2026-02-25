
import { useCallback } from 'react';
import { useApp } from '@/shared/app-providers/app-context';
import {
  uploadDailyPhoto as uploadDailyPhotoAction,
  uploadTaskAttachment as uploadTaskAttachmentAction,
} from '../_storage-actions';

/**
 * @fileoverview A hook for abstracting file storage operations.
 * This hook acts as the designated bridge between UI components and the
 * underlying storage infrastructure, ensuring components do not directly
 * interact with SDKs, thus adhering to architectural boundaries.
 */
export function useStorage(workspaceId: string) {
  const { state: appState } = useApp();
  const { activeAccount } = appState;

  /**
   * Uploads a photo for a daily log entry.
   * @param file The File object to upload.
   * @returns A promise that resolves with the public download URL of the uploaded file.
   */
  const uploadDailyPhoto = useCallback(async (file: File) => {
    if (!activeAccount || activeAccount.accountType !== 'organization') {
      throw new Error("Photo uploads are only supported in an organization context.");
    }
    // Delegates the actual upload logic to the actions layer.
    return uploadDailyPhotoAction(activeAccount.id, workspaceId, file);
  }, [activeAccount, workspaceId]);

  /**
   * Uploads an image attachment for a workspace task.
   * @param file The file to upload.
   * @returns A promise resolving to the public download URL of the file.
   */
  const uploadTaskAttachment = useCallback(async (file: File) => {
    if (!workspaceId) {
      throw new Error("A workspace context is required to upload task attachments.");
    }
    return uploadTaskAttachmentAction(workspaceId, file);
  }, [workspaceId]);

  return { uploadDailyPhoto, uploadTaskAttachment };
}
