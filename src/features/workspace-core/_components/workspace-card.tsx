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
    router.push(`/workspaces/${workspace.id}`);
  };

  return (
    <Card
      className="group cursor-pointer border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-primary/5 p-2.5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <Shield className="size-5" />
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className="flex size-6 items-center justify-center p-0 text-muted-foreground"
            >
              {workspace.visibility === "visible" ? (
                <Eye className="size-3.5" />
              ) : (
                <EyeOff className="size-3.5" />
              )}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:bg-accent/10"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="size-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="mt-4 truncate font-headline text-lg transition-colors group-hover:text-primary">
          {workspace.name}
        </CardTitle>
        <CardDescription className="text-[9px] font-bold uppercase tracking-widest opacity-60">
          {t("workspaces.lifecycleState")}: {workspace.lifecycleState}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-1 flex min-h-[32px] flex-wrap gap-1.5">
          {(workspace.scope || []).slice(0, 3).map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="border-none bg-muted/50 px-1.5 py-0 text-[8px] uppercase tracking-tighter"
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
      <CardFooter className="mt-4 flex items-center justify-between border-t border-border/20 py-4 pt-0">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold uppercase leading-none tracking-tighter text-muted-foreground">
            [{t("workspaces.defaultProtocol")}]
          </span>
          <span className="max-w-[120px] truncate font-mono text-[10px]">
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
                className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-[8px] font-bold shadow-sm"
              >
                {g.userId?.[0].toUpperCase() || "U"}
              </div>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}
