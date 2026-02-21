// [職責] 顯示 Mounted/Isolated 狀態
"use client";

import { Badge } from "@/shared/shadcn-ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { useWorkspace } from "@/features/workspace-core";

export function WorkspaceStatusBar() {
  const { workspace } = useWorkspace();
  const isVisible = workspace.visibility === "visible";

  return (
    <div className="flex items-center gap-2">
      <Badge
        className="border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary"
      >
        ID: {workspace.id.toUpperCase()}
      </Badge>
      <Badge
        variant="outline"
        className="flex items-center gap-1 bg-background/50 text-[9px] font-bold uppercase backdrop-blur-sm"
      >
        {isVisible ? (
          <Eye className="size-3.5" />
        ) : (
          <EyeOff className="size-3.5" />
        )}
        {isVisible ? "Mounted" : "Isolated"}
      </Badge>
    </div>
  );
}
