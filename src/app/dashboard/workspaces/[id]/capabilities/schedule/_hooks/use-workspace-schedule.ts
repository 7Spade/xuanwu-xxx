// [職責] Business — 單一 Workspace 排程提案與狀態邏輯
/**
 * @fileoverview useWorkspaceSchedule - Hook for workspace-scoped schedule state and actions.
 * @description Encapsulates all data derivation, state management, side effects, and
 * write actions for the workspace schedule feature. Keeps the view component as a thin renderer.
 *
 * @responsibility
 * - Derive `localItems` (workspace-filtered) from AccountContext.
 * - Derive `orgMembers` from AppContext active account.
 * - Handle `scheduleTaskRequest` cross-capability hint effect.
 * - Manage calendar navigation state: `currentDate`.
 * - Manage proposal dialog state: `isAddDialogOpen`, `dialogInitialDate`.
 * - Handle schedule item creation via WorkspaceContext.
 */
"use client";

import { useMemo, useState, useEffect } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { useApp } from "@/hooks/state/use-app";
import { useAccount } from "@/hooks/state/use-account";
import { toast } from "@/hooks/ui/use-toast";
import { addMonths, subMonths } from "date-fns";
import type { ScheduleItem, Location } from "@/types/domain";

export function useWorkspaceSchedule() {
  const { workspace, createScheduleItem } = useWorkspace();
  const { state: appState, dispatch: appDispatch } = useApp();
  const { state: accountState } = useAccount();
  const { accounts, activeAccount, scheduleTaskRequest } = appState;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [dialogInitialDate, setDialogInitialDate] = useState(new Date());

  // Cross-capability hint: when a task triggers a schedule request, surface a toast.
  useEffect(() => {
    if (scheduleTaskRequest && scheduleTaskRequest.workspaceId === workspace.id) {
      toast({
        title: "Schedule Request Hint",
        description: `A new task "${scheduleTaskRequest.taskName}" is ready. You can now add it to the schedule.`,
      });
      appDispatch({ type: "CLEAR_SCHEDULE_TASK_REQUEST" });
    }
  }, [scheduleTaskRequest, workspace.id, appDispatch]);

  const activeOrg = useMemo(() =>
    activeAccount?.accountType === "organization" ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  );

  const orgMembers = useMemo(() => activeOrg?.members || [], [activeOrg]);

  const localItems = useMemo(() =>
    Object.values(accountState.schedule_items || {}).filter(item => item.workspaceId === workspace.id),
    [accountState.schedule_items, workspace.id]
  );

  const handleCreateItem = async (data: {
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    location: Location;
  }) => {
    const newItemData = {
      accountId: workspace.dimensionId,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      title: data.title.trim(),
      description: data.description?.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      status: "PROPOSAL",
      originType: "MANUAL",
      assigneeIds: [],
    };
    await createScheduleItem(newItemData as Omit<ScheduleItem, "id" | "createdAt" | "updatedAt">);
    toast({ title: "Schedule Proposal Sent", description: "Your request has been sent for organization approval." });
    setIsAddDialogOpen(false);
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentDate(current => direction === "prev" ? subMonths(current, 1) : addMonths(current, 1));
  };

  const handleOpenAddDialog = (date: Date) => {
    setDialogInitialDate(date);
    setIsAddDialogOpen(true);
  };

  return {
    localItems,
    orgMembers,
    currentDate,
    handleMonthChange,
    isAddDialogOpen,
    setIsAddDialogOpen,
    dialogInitialDate,
    handleOpenAddDialog,
    handleCreateItem,
  };
}
