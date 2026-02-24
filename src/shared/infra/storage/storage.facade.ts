/**
 * @fileoverview Cloud Storage Facade.
 *
 * This file acts as a simplified, high-level interface to the Storage adapters.
 * Its purpose is to encapsulate more complex business-specific operations.
 */

import { uploadFile } from './storage.write.adapter';
import { getFileDownloadURL } from './storage.read.adapter';

/**
 * Uploads a photo for a daily log entry to a structured path and returns its public URL.
 * @param accountId The ID of the account.
 * @param workspaceId The ID of the workspace.
 * @param file The File object to upload.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadDailyPhoto = async (
  accountId: string,
  workspaceId: string,
  file: File
): Promise<string> => {
  const fileId = Math.random().toString(36).substring(2, 11);
  const storagePath = `daily-photos/${accountId}/${workspaceId}/${fileId}/${file.name}`;

  await uploadFile(storagePath, file);

  return getFileDownloadURL(storagePath);
};


/**
 * Uploads a file as an attachment for a workspace task.
 * @param workspaceId The ID of the workspace where the task resides.
 * @param file The file to be uploaded.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadTaskAttachment = async (
  workspaceId: string,
  file: File
): Promise<string> => {
  const fileId = Math.random().toString(36).substring(2, 11);
  const storagePath = `task-attachments/${workspaceId}/${fileId}/${file.name}`;

  await uploadFile(storagePath, file);

  return getFileDownloadURL(storagePath);
};

/**
 * Uploads a user's profile picture.
 * @param userId The ID of the user.
 * @param file The image file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadProfilePicture = async (
  userId: string,
  file: File
): Promise<string> => {
  // Use a consistent path to allow for easy overwriting.
  const storagePath = `user-profiles/${userId}/avatar.jpg`;

  await uploadFile(storagePath, file, { contentType: 'image/jpeg' });

  return getFileDownloadURL(storagePath);
};

/**
 * Uploads a raw workspace document to Firebase Storage under a versioned path.
 * Returns both the download URL and the storage path for external reference.
 *
 * This is the single-responsibility upload boundary for workspace-business.files.
 * Firestore metadata writes remain the caller's responsibility so they can use
 * atomic operations (arrayUnion, serverTimestamp).
 *
 * @param workspaceId The workspace that owns the file.
 * @param fileId      The logical file ID (stable across versions).
 * @param versionId   A unique ID for this specific version.
 * @param file        The raw file to upload.
 * @returns The public download URL for the uploaded version.
 */
export const uploadWorkspaceDocument = async (
  workspaceId: string,
  fileId: string,
  versionId: string,
  file: File
): Promise<string> => {
  const storagePath = `files-plugin/${workspaceId}/${fileId}/${versionId}/${file.name}`;
  await uploadFile(storagePath, file);
  return getFileDownloadURL(storagePath);
};
