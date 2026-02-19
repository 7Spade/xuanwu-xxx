// [職責] Business — 單一 Workspace 日誌撰寫與狀態邏輯
/**
 * @fileoverview useWorkspaceDailyLog - Hook for workspace-scoped daily log state and actions.
 * @description Encapsulates all data derivation, state management, and write actions
 * for the workspace daily log feature. Keeps the view component as a thin renderer.
 *
 * @responsibility
 * - Derive `localLogs` (filtered + sorted) from AccountContext.
 * - Manage composer state: `content`, `photos`.
 * - Manage dialog state: `selectedLog`.
 * - Handle log post (upload + write) via `useDailyUpload` and `useLogger`.
 */
"use client";

import { useState, useMemo } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { useAccount } from "@/hooks/state/use-account";
import { useAuth } from "@/context/auth-context";
import { useLogger } from "@/hooks/infra/use-logger";
import { toast } from "@/hooks/ui/use-toast";
import { useDailyUpload } from "./use-daily-upload";
import { DailyLog } from "@/types/domain";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function useWorkspaceDailyLog() {
  const { workspace } = useWorkspace();
  const { state: accountState } = useAccount();
  const { state: authState } = useAuth();
  const { dailyLogs } = accountState;
  const { user } = authState;
  const { logDaily } = useLogger(workspace.id, workspace.name);
  const { isUploading, upload } = useDailyUpload();

  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

  const localLogs = useMemo(() =>
    Object.values(dailyLogs as Record<string, DailyLog>)
      .filter(log => log.workspaceId === workspace.id)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
    [dailyLogs, workspace.id]
  );

  const handlePost = async () => {
    if (!content.trim() && photos.length === 0) return;
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to post." });
      return;
    }
    try {
      const photoURLs = await upload(photos);
      await logDaily(content, photoURLs, user);
      setContent("");
      setPhotos([]);
      toast({ title: "Daily log posted successfully." });
    } catch (error: unknown) {
      console.error("Error posting daily log:", error);
      toast({
        variant: "destructive",
        title: "Post Failed",
        description: getErrorMessage(error, "An unknown error occurred."),
      });
    }
  };

  return {
    user,
    localLogs,
    content,
    setContent,
    photos,
    setPhotos,
    isUploading,
    selectedLog,
    setSelectedLog,
    handlePost,
  };
}
