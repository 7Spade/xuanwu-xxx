/**
 * @fileoverview Cloud Storage Facade.
 *
 * This file provides all Cloud Storage operations for the application.
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './storage.client';

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
  await uploadBytes(ref(storage, storagePath), file);
  return getDownloadURL(ref(storage, storagePath));
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
  await uploadBytes(ref(storage, storagePath), file);
  return getDownloadURL(ref(storage, storagePath));
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
  const storagePath = `user-profiles/${userId}/avatar.jpg`;
  await uploadBytes(ref(storage, storagePath), file, { contentType: 'image/jpeg' });
  return getDownloadURL(ref(storage, storagePath));
};
