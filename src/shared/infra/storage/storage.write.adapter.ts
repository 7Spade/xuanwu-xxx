/**
 * @fileoverview Cloud Storage Write Adapter.
 * This file contains all write operations for Firebase Storage,
 * such as file uploads and deletions.
 */

import {
  ref,
  uploadBytes,
  deleteObject,
  type UploadResult,
  type UploadMetadata,
} from 'firebase/storage';
import { storage } from './storage.client';

/**
 * Uploads a file to a specified path in Cloud Storage.
 * @param path The full path where the file will be stored.
 * @param file The file object (Blob or File) to upload.
 * @param metadata Optional metadata for the file.
 * @returns A promise that resolves with an UploadResult on success.
 */
export const uploadFile = (
  path: string,
  file: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata
): Promise<UploadResult> => {
  const fileRef = ref(storage, path);
  return uploadBytes(fileRef, file, metadata);
};

/**
 * Deletes a file from Cloud Storage.
 * @param path The full path of the file to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteFile = (path: string): Promise<void> => {
  const fileRef = ref(storage, path);
  return deleteObject(fileRef);
};
