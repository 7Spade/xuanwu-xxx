// [職責] Projection — 單一 Workspace 事件流 (本地、唯讀)
"use client";

import { Activity } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn-ui/card";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { AuditTypeIcon } from "./audit-type-icon";
import { AuditDetailSheet } from "./audit-detail-sheet";
import { useWorkspaceAudit } from "../_hooks/use-workspace-audit";

export function WorkspaceAudit() {
  const { localAuditLogs, selectedLog, setSelectedLog, clearSelection } = useWorkspaceAudit();

  return (
    <div className="duration-500 animate-in fade-in">
      <Card className="flex h-[calc(100vh-20rem)] flex-col overflow-hidden border-border/60 bg-card/50 shadow-sm backdrop-blur-sm">
        <CardHeader className="border-b bg-primary/5 pb-3">
          <CardTitle className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Activity className="size-4 animate-pulse text-primary" /> Local Space Pulse
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              {localAuditLogs.map((log) => (
                <button key={log.id} type="button" className="relative w-full cursor-pointer pl-8 text-left" onClick={() => setSelectedLog(log)}>
                  <div className="absolute left-[7px] top-1 h-full w-px bg-border/50" />
                  <div className="absolute left-1.5 top-1 flex size-4 items-center justify-center rounded-full border-2 border-primary/40 bg-background">
                    <AuditTypeIcon type={log.type} />
                  </div>
                  <p className="text-xs font-bold leading-none">{log.action}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {log.actor} • {log.recordedAt?.seconds ? format(log.recordedAt.seconds * 1000, "HH:mm") : "..."}
                  </p>
                </button>
              ))}
              {localAuditLogs.length === 0 && (
                <div className="pt-20 text-center text-xs italic text-muted-foreground opacity-50">
                  No audit events recorded for this space yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AuditDetailSheet
        log={selectedLog}
        isOpen={!!selectedLog}
        onOpenChange={(open) => { if (!open) clearSelection(); }}
      />
    </div>
  );
}
