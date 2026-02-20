// [職責] Business — 單一 Workspace 排程提案與檢視
"use client";

import { UnifiedCalendarGrid } from "./_components/unified-calendar-grid";
import { useWorkspaceSchedule } from "./_hooks/use-workspace-schedule";

export function WorkspaceSchedule() {
  const {
    localItems,
    orgMembers,
    currentDate,
    handleMonthChange,
    handleOpenAddDialog,
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
    </div>
  );
}
