// [職責] Business — 單一 Workspace 排程提案與檢視
"use client";

import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/shared/shadcn-ui/button";
import { UnifiedCalendarGrid } from "./unified-calendar-grid";
import { useWorkspaceSchedule } from "../_hooks/use-workspace-schedule";
import { useWorkspace } from "@/features/workspace-core";

export function WorkspaceSchedule() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const {
    localItems,
    organizationMembers,
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
          className="h-9 gap-2 text-[10px] font-bold uppercase tracking-widest"
          onClick={() => router.push(`/workspaces/${workspace.id}/governance`)}
        >
          <Shield className="size-3.5" /> Governance Panel
        </Button>
      </div>
      <div className="h-[calc(100vh-22rem)]">
        <UnifiedCalendarGrid
          items={localItems}
          members={organizationMembers}
          viewMode="workspace"
          currentDate={currentDate}
          onMonthChange={handleMonthChange}
          onAddClick={handleOpenAddDialog}
        />
      </div>
    </div>
  );
}
