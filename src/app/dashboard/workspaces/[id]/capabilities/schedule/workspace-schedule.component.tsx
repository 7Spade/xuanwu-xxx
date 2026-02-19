
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useWorkspace } from "../../../../../../context/workspace-context";
import { useApp } from "@/hooks/state/use-app";
import { useAccount } from "@/hooks/state/use-account";
import { UnifiedCalendarGrid } from "@/app/dashboard/_components/schedule/unified-calendar-grid";
import { toast } from "@/hooks/ui/use-toast";
import { ProposalDialog } from "./_components/proposal-dialog";
import { addMonths, subMonths } from "date-fns";
import type { ScheduleItem, Location } from "@/types/domain";

/**
 * @fileoverview WorkspaceScheduleComponent - The "Proposer" view for a single workspace's schedule.
 * @description REFACTORED: This component now manages state for its child dialogs
 * and passes callbacks to the dumb `UnifiedCalendarGrid` component, adhering to SRP.
 * It no longer contains logic for member assignment.
 */
export function WorkspaceSchedule() {
  const { workspace, createScheduleItem } = useWorkspace();
  const { state: appState, dispatch: appDispatch } = useApp();
  const { state: accountState } = useAccount();
  const { accounts, activeAccount, scheduleTaskRequest } = appState;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [dialogInitialDate, setDialogInitialDate] = useState(new Date());

  useEffect(() => {
    if (scheduleTaskRequest && scheduleTaskRequest.workspaceId === workspace.id) {
        toast({
            title: "Schedule Request Hint",
            description: `A new task "${scheduleTaskRequest.taskName}" is ready. You can now add it to the schedule.`,
        });
        appDispatch({ type: 'CLEAR_SCHEDULE_TASK_REQUEST' });
    }
  }, [scheduleTaskRequest, workspace.id, appDispatch]);

  const activeOrg = useMemo(() => 
    activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  );
  
  const orgMembers = useMemo(() => activeOrg?.members || [], [activeOrg]);

  const localItems = useMemo(() => 
    Object.values(accountState.schedule_items || {}).filter(item => item.workspaceId === workspace.id),
    [accountState.schedule_items, workspace.id]
  );
  
  const handleCreateItem = async (data: { title: string; description?: string; startDate?: Date; endDate?: Date; location: Location; }) => {
      const newItemData = {
        accountId: workspace.dimensionId,
        workspaceId: workspace.id,
        title: data.title.trim(),
        description: data.description?.trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        status: 'PROPOSAL', 
        originType: 'MANUAL',
        assigneeIds: [],
      };
      await createScheduleItem(newItemData as Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>);
      toast({ title: "Schedule Proposal Sent", description: "Your request has been sent for organization approval." });
      setIsAddDialogOpen(false);
  };
  
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
  };
  
  const handleOpenAddDialog = (date: Date) => {
    setDialogInitialDate(date);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="h-[calc(100vh-18rem)]">
       <UnifiedCalendarGrid 
          items={localItems} 
          members={orgMembers} 
          viewMode="workspace"
          currentDate={currentDate}
          onMonthChange={handleMonthChange}
          onAddClick={handleOpenAddDialog}
        />
        <ProposalDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleCreateItem}
          initialDate={dialogInitialDate}
        />
    </div>
  );
}
