// [職責] 網格佈局容器
"use client";

import type { Workspace } from "@/shared/types";
import { WorkspaceCard } from "./workspace-card";

interface WorkspaceGridViewProps {
  workspaces: Workspace[];
}

export function WorkspaceGridView({ workspaces }: WorkspaceGridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((w) => (
        <WorkspaceCard key={w.id} workspace={w} />
      ))}
    </div>
  );
}
