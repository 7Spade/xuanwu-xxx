// [職責] 單個 Workspace 的卡片展示
"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/shared/shadcn-ui/card";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Button } from "@/shared/shadcn-ui/button";
import { MoreVertical, Eye, EyeOff, Shield } from "lucide-react";
import type { Workspace } from "@/shared/types";
import { useI18n } from "@/shared/app-providers/i18n-provider";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const router = useRouter();
  const { t } = useI18n();

  const handleClick = () => {
    router.push(`/dashboard/workspaces/${workspace.id}`);
  };

  return (
    <Card
      className="group border-border/60 hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer bg-card/60 backdrop-blur-sm"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="ghost"
              className="h-6 w-6 p-0 flex items-center justify-center text-muted-foreground"
            >
              {workspace.visibility === "visible" ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-accent/10"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="mt-4 font-headline text-lg group-hover:text-primary transition-colors truncate">
          {workspace.name}
        </CardTitle>
        <CardDescription className="text-[9px] uppercase tracking-widest font-bold opacity-60">
          {t("workspaces.lifecycleState")}: {workspace.lifecycleState}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 mt-1 min-h-[32px]">
          {(workspace.scope || []).slice(0, 3).map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="text-[8px] px-1.5 py-0 uppercase tracking-tighter bg-muted/50 border-none"
            >
              {s}
            </Badge>
          ))}
          {(workspace.scope || []).length > 3 && (
            <span className="text-[8px] text-muted-foreground opacity-60">
              +{(workspace.scope || []).length - 3}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center border-t border-border/20 mt-4 py-4">
        <div className="flex flex-col">
          <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter leading-none">
            [{t("workspaces.defaultProtocol")}]
          </span>
          <span className="text-[10px] font-mono truncate max-w-[120px]">
            {workspace.protocol || t("workspaces.standard")}
          </span>
        </div>
        <div className="flex -space-x-1.5">
          {(workspace.grants || [])
            .filter((g) => g.status === "active")
            .slice(0, 3)
            .map((g, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-background bg-primary/10 text-[8px] flex items-center justify-center font-bold shadow-sm"
              >
                {g.userId?.[0].toUpperCase() || "U"}
              </div>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}
