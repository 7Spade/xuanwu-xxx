// [職責] Business — 單一 Workspace 排程提案與檢視
"use client";

import { UnifiedCalendarGrid } from "@/app/dashboard/_components/schedule/unified-calendar-grid";
import { ProposalDialog } from "./_components/proposal-dialog";
import { useWorkspaceSchedule } from "./_hooks/use-workspace-schedule";

export function WorkspaceSchedule() {
  const {
    localItems,
    orgMembers,
    currentDate,
    handleMonthChange,
    isAddDialogOpen,
    setIsAddDialogOpen,
    dialogInitialDate,
    handleOpenAddDialog,
    handleCreateItem,
  } = useWorkspaceSchedule();

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
