// [職責] 列表佈局容器
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/shadcn-ui/button";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Eye, EyeOff, Shield, ArrowUpRight } from "lucide-react";
import type { Workspace } from "@/shared/types";
import { useI18n } from "@/shared/app-providers/i18n-provider";

interface WorkspaceListItemProps {
  workspace: Workspace;
}

function WorkspaceListItem({ workspace }: WorkspaceListItemProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <button
      type="button"
      className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30"
      onClick={() => router.push(`/workspaces/${workspace.id}`)}
    >
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-primary/5 p-2 text-primary">
          <Shield className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{workspace.name}</h3>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge
              variant="outline"
              className="flex h-4 items-center gap-1 px-1.5 text-[9px] uppercase tracking-tighter"
            >
              {workspace.visibility === "visible" ? (
                <Eye className="size-3" />
              ) : (
                <EyeOff className="size-3" />
              )}
              {workspace.visibility === "visible"
                ? t("common.visible")
                : t("common.hidden")}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              ID: {workspace.id.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right md:block">
          <p className="mb-1 text-[9px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
            {t("workspaces.accessProtocol")}
          </p>
          <p className="text-[11px] font-medium">
            {workspace.protocol || t("workspaces.defaultProtocol")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-primary"
          >
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </div>
    </button>
  );
}

interface WorkspaceTableViewProps {
  workspaces: Workspace[];
}

export function WorkspaceTableView({ workspaces }: WorkspaceTableViewProps) {
  return (
    <div className="flex flex-col gap-3">
      {workspaces.map((w) => (
        <WorkspaceListItem key={w.id} workspace={w} />
      ))}
    </div>
  );
}
