// [職責] Business — 單一 Workspace 排程提案與狀態邏輯
/**
 * @fileoverview useWorkspaceSchedule - Hook for workspace-scoped schedule state and actions.
 * @description Encapsulates data derivation, state management, side effects, and
 * write actions for the workspace schedule feature. Keeps the view component as a thin renderer.
 *
 * @responsibility
 * - Derive `localItems` (workspace-filtered) from AccountContext.
 * - Derive `organizationMembers` from AppContext active account.
 * - Handle `scheduleTaskRequest` cross-capability hint effect.
 * - Manage calendar navigation state: `currentDate`.
 */
"use client";

import { useMemo, useState, useEffect } from "react";
import { useWorkspace } from "@/features/workspace-core";
import { useAccount } from "@/features/workspace-core";
import { useApp } from "@/shared/app-providers/app-context";
import { useRouter } from "next/navigation";
import { toast } from "@/shared/utility-hooks/use-toast";
import { addMonths, subMonths, format } from "date-fns";

export function useWorkspaceSchedule() {
  const { workspace } = useWorkspace();
  const { state: appState, dispatch: appDispatch } = useApp();
  const { state: accountState } = useAccount();
  const { accounts, activeAccount, scheduleTaskRequest } = appState;
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());

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

  const activeOrganization = useMemo(() =>
    activeAccount?.accountType === "organization" ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  );

  const organizationMembers = useMemo(() => activeOrganization?.members || [], [activeOrganization]);

  const localItems = useMemo(() =>
    Object.values(accountState.schedule_items || {}).filter(item => item.workspaceId === workspace.id),
    [accountState.schedule_items, workspace.id]
  );

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentDate(current => direction === "prev" ? subMonths(current, 1) : addMonths(current, 1));
  };

  const handleOpenAddDialog = (date: Date) => {
    router.push(`schedule-proposal?date=${format(date, "yyyy-MM-dd")}`);
  };

  return {
    localItems,
    organizationMembers,
    currentDate,
    handleMonthChange,
    handleOpenAddDialog,
  };
}

