// [職責] Business — 單一 Workspace 排程提案與檢視
"use client";

import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/shared/shadcn-ui/button";
import { UnifiedCalendarGrid } from "./_route-components/unified-calendar-grid";
import { useWorkspaceSchedule } from "./_plugin-hooks/use-workspace-schedule";
import { useWorkspace } from "@/react-providers/workspace-provider";

export function WorkspaceSchedule() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const {
    localItems,
    orgMembers,
    currentDate,
    handleMonthChange,
    handleOpenAddDialog,
  } = useWorkspaceSchedule();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest"
          onClick={() => router.push(`/dashboard/workspaces/${workspace.id}/governance`)}
        >
          <Shield className="w-3.5 h-3.5" /> Governance Panel
        </Button>
      </div>
      <div className="h-[calc(100vh-22rem)]">
        <UnifiedCalendarGrid
          items={localItems}
          members={orgMembers}
          viewMode="workspace"
          currentDate={currentDate}
          onMonthChange={handleMonthChange}
          onAddClick={handleOpenAddDialog}
        />
      </div>
    </div>
  );
}
