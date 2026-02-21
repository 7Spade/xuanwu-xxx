/**
 * @fileoverview use-workspace-commands.ts - Hook for workspace lifecycle write operations.
 */
"use client";

import { useCallback } from "react";
import { deleteWorkspace } from "../_actions";
import { toast } from "@/shared/utility-hooks/use-toast";

export function useWorkspaceCommands() {
  const handleDeleteWorkspace = useCallback(async (
    workspaceId: string,
    onSuccess: () => void
  ) => {
    try {
      await deleteWorkspace(workspaceId);
      toast({ title: "Workspace node destroyed" });
      onSuccess();
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast({
        variant: "destructive",
        title: "Failed to Destroy Space",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  }, []);

  return { handleDeleteWorkspace };
}
