
/**
 * @fileoverview use-schedule-actions.ts - Hook for managing schedule-related write operations.
 * @description This hook centralizes business logic for interactive features
 * on schedule items, such as assigning members and approving/rejecting proposals.
 * It acts as the bridge between UI components and the infrastructure layer,
 * respecting architectural boundaries.
 */
"use client";

import { useCallback } from "react";
import { useApp } from "@/features/workspace-core";
import { useAuth } from "@/shared/app-providers/auth-provider";
import {
    assignMember as assignMemberAction,
    unassignMember as unassignMemberAction,
    updateScheduleItemStatus,
} from "../_actions";
import { canTransitionScheduleStatus } from "@/shared/lib";
import { toast } from "@/shared/utility-hooks/use-toast";
import type { ScheduleItem } from "@/shared/types";

export function useScheduleActions() {
  const { state: appState } = useApp();
  const { state: authState } = useAuth();
  const { activeAccount } = appState;
  const { user } = authState;

  const assignMember = useCallback(async (item: ScheduleItem, memberId: string) => {
    if (!user || !activeAccount || activeAccount.accountType !== 'organization') {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be in an organization to assign members.",
      });
      return;
    }

    try {
      await assignMemberAction(item.accountId, item.id, memberId);
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
    if (!user || !activeAccount || activeAccount.accountType !== 'organization') {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be in an organization to unassign members.",
      });
      return;
    }

    try {
      await unassignMemberAction(item.accountId, item.id, memberId);
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

  const approveItem = useCallback(async (item: ScheduleItem) => {
    if (!canTransitionScheduleStatus(item.status, "OFFICIAL")) {
      throw new Error(`Cannot approve: invalid transition ${item.status} → OFFICIAL`);
    }
    await updateScheduleItemStatus(item.accountId, item.id, "OFFICIAL");
  }, []);

  const rejectItem = useCallback(async (item: ScheduleItem) => {
    if (!canTransitionScheduleStatus(item.status, "REJECTED")) {
      throw new Error(`Cannot reject: invalid transition ${item.status} → REJECTED`);
    }
    await updateScheduleItemStatus(item.accountId, item.id, "REJECTED");
  }, []);

  return { assignMember, unassignMember, approveItem, rejectItem };
}
