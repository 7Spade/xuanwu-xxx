
/**
 * @fileoverview use-schedule-actions.ts - Hook for managing schedule-related write operations.
 * @description This hook centralizes business logic for interactive features
 * on schedule items, such as assigning members. It acts as the bridge
 * between UI components and the infrastructure layer, respecting architectural
 * boundaries.
 */
"use client";

import { useCallback } from "react";
import { useApp } from "@/hooks/state/use-app";
import { useAuth } from "@/context/auth-context";
import { 
    assignMemberToScheduleItem,
    unassignMemberFromScheduleItem,
} from "@/infra/firebase/firestore/firestore.facade";
import { toast } from "@/hooks/ui/use-toast";
import { ScheduleItem } from "@/types/domain";

export function useScheduleActions() {
  const { state: appState } = useApp();
  const { state: authState } = useAuth();
  const { activeAccount } = appState;
  const { user } = authState;

  const assignMember = useCallback(async (item: ScheduleItem, memberId: string) => {
    if (!user || !activeAccount || activeAccount.type !== "organization") {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be in an organization to assign members.",
      });
      return;
    }

    try {
      await assignMemberToScheduleItem(item.workspaceId, item.id, memberId);
      toast({ title: "Member Assigned", description: "The schedule item has been updated." });
    } catch (error) {
      console.error("Failed to assign member:", error);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description:
          error instanceof Error ? error.message : "Could not assign member.",
      });
    }
  }, [user, activeAccount]);

  const unassignMember = useCallback(async (item: ScheduleItem, memberId: string) => {
    if (!user || !activeAccount || activeAccount.type !== "organization") {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be in an organization to unassign members.",
      });
      return;
    }

    try {
      await unassignMemberFromScheduleItem(item.workspaceId, item.id, memberId);
      toast({ title: "Member Unassigned" });
    } catch (error) {
      console.error("Failed to unassign member:", error);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description:
          error instanceof Error ? error.message : "Could not unassign member.",
      });
    }
  }, [user, activeAccount]);

  return { assignMember, unassignMember };
}
