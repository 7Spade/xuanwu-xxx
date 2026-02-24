/**
 * @fileoverview storage.commands.ts - Pure business logic for file storage operations.
 * @description Contains framework-agnostic action functions for uploading files to
 * Firebase Storage. These functions can be called from React hooks, context, or
 * future Server Actions without any React dependencies.
 */

import {
  uploadDailyPhoto as uploadDailyPhotoFacade,
  uploadTaskAttachment as uploadTaskAttachmentFacade,
  uploadProfilePicture as uploadProfilePictureFacade,
  uploadWorkspaceDocument,
} from "@/shared/infra/storage/storage.facade"

/**
 * Uploads a photo for a daily log entry.
 * @param accountId The ID of the organization account.
 * @param workspaceId The ID of the workspace.
 * @param file The File object to upload.
 * @returns A promise resolving with the public download URL.
 */
export async function uploadDailyPhoto(
  accountId: string,
  workspaceId: string,
  file: File
): Promise<string> {
  return uploadDailyPhotoFacade(accountId, workspaceId, file)
}

/**
 * Uploads a file as an attachment for a workspace task.
 * @param workspaceId The ID of the workspace.
 * @param file The file to upload.
 * @returns A promise resolving with the public download URL.
 */
export async function uploadTaskAttachment(
  workspaceId: string,
  file: File
): Promise<string> {
  return uploadTaskAttachmentFacade(workspaceId, file)
}

/**
 * Uploads a user's profile picture.
 * @param userId The ID of the user.
 * @param file The image file to upload.
 * @returns A promise resolving with the public download URL.
 */
export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<string> {
  return uploadProfilePictureFacade(userId, file)
}

/**
 * Uploads a raw workspace document to Firebase Storage.
 *
 * Single-responsibility boundary for workspace-business.files:
 * all Firebase Storage SDK interaction lives in the storage facade and adapters,
 * not in UI components.
 *
 * @param workspaceId The workspace that owns the file.
 * @param fileId      The logical file document ID (stable across versions).
 * @param versionId   A unique ID for this specific version upload.
 * @param file        The raw file to store.
 * @returns A promise resolving with the public download URL for this version.
 */
export async function uploadRawFile(
  workspaceId: string,
  fileId: string,
  versionId: string,
  file: File
): Promise<string> {
  return uploadWorkspaceDocument(workspaceId, fileId, versionId, file)
}
