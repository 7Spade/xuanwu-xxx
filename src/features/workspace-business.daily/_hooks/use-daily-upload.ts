/**
 * @fileoverview useDailyUpload - A hook for handling daily log image uploads.
 * @description This hook abstracts the logic for compressing, uploading, and
 * retrieving download URLs for images associated with a daily log. It uses the
 * `useStorage` hook internally to interact with the storage infrastructure,
 * ensuring architectural boundaries are respected.
 *
 * @responsibility
 * - Encapsulate file upload logic specific to daily logs.
 * - Provide a simple interface for components to upload files.
 * - Handle upload state (loading, error, success).
 */
"use client";

import { useState, useCallback } from "react";
import { useStorage } from "@/features/workspace-business.files";
import { useWorkspace } from "@/features/workspace-core";

export function useDailyUpload() {
  const { workspace } = useWorkspace();
  const { uploadDailyPhoto } = useStorage(workspace.id);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    setIsUploading(true);
    try {
      const urls = await Promise.all(
        files.map(file => uploadDailyPhoto(file))
      );
      return urls;
    } catch (error) {
      console.error("Daily upload failed:", error);
      // Depending on the desired UX, you might want to throw the error
      // or handle it by showing a toast notification here.
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [uploadDailyPhoto]);

  return { isUploading, upload };
}
