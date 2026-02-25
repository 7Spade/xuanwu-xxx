// @/features/workspace-business.daily/_hooks/use-daily-commands.ts
/**
 * @fileoverview useDailyActions - A hook for managing actions on daily logs.
 * @description This hook centralizes business logic for interactive features
 * on daily log entries, such as liking or bookmarking. It acts as the bridge
 * between UI components and the infrastructure layer, respecting architectural
 * boundaries.
 *
 * @responsibility
 * - Provide simple functions for UI components to call (e.g., `toggleLike`).
 * - Handle user authentication checks.
 * - Call the appropriate infrastructure repository functions.
 * - (Future) Implement optimistic UI updates.
 */
"use client";

import { useCallback } from "react";
import { useApp } from "@/shared/app-providers/app-context";
import { useAuth } from "@/shared/app-providers/auth-provider";
import { toggleLike as toggleLikeAction } from "../_actions";
import { toast } from "@/shared/utility-hooks/use-toast";

export function useDailyActions() {
  const { state: appState } = useApp();
  const { state: authState } = useAuth();
  const { activeAccount } = appState;
  const { user } = authState;

  const toggleLike = useCallback(
    async (logId: string) => {
      if (!user || !activeAccount || activeAccount.accountType !== 'organization') {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be in an organization to interact.",
        });
        return;
      }

      try {
        // Here we could implement an optimistic update to the local state
        // for a more responsive UI, before waiting for the backend call.
        await toggleLikeAction(activeAccount.id, logId, user.id);
      } catch (error) {
        console.error("Failed to toggle like:", error);
        toast({
          variant: "destructive",
          title: "Action Failed",
          description:
            error instanceof Error ? error.message : "Could not update like status.",
        });
        // Here we would revert the optimistic update if it failed.
      }
    },
    [user, activeAccount]
  );

  return { toggleLike };
}
