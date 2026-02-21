/**
 * @fileoverview Cloud Storage Read Adapter.
 * This file contains all read-only operations for Firebase Storage,
 * such as getting download URLs and listing files.
 */

import { ref, getDownloadURL, listAll, type ListResult } from 'firebase/storage';
import { storage } from './storage.client';

/**
 * Gets the public download URL for a file in Storage.
 * @param path The full path to the file in the bucket.
 * @returns A promise that resolves to the public URL string.
 */
export const getFileDownloadURL = (path: string): Promise<string> => {
  const fileRef = ref(storage, path);
  return getDownloadURL(fileRef);
};

/**
 * Lists all files and sub-directories within a given storage path.
 * @param path The path to the directory to list.
 * @returns A promise that resolves to a ListResult object.
 */
export const listFiles = (path: string): Promise<ListResult> => {
  const folderRef = ref(storage, path);
  return listAll(folderRef);
};
