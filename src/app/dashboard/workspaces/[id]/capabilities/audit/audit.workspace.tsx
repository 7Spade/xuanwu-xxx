// [職責] Projection — 單一 Workspace 事件流 (本地、唯讀)
"use client";

import { Activity } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn-ui/card";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { AuditTypeIcon } from "./_components/audit-type-icon";
import { AuditDetailSheet } from "./_components/audit-detail-sheet";
import { useWorkspaceAudit } from "./_hooks/use-workspace-audit";

export function WorkspaceAudit() {
  const { localAuditLogs, selectedLog, setSelectedLog, clearSelection } = useWorkspaceAudit();

  return (
    <div className="animate-in fade-in duration-500">
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm h-[calc(100vh-20rem)] flex flex-col">
        <CardHeader className="pb-3 bg-primary/5 border-b">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" /> Local Space Pulse
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              {localAuditLogs.map((log) => (
                <div key={log.id} className="relative pl-8 cursor-pointer" onClick={() => setSelectedLog(log)}>
                  <div className="absolute left-[7px] top-1 h-full w-px bg-border/50" />
                  <div className="absolute left-1.5 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary/40">
                    <AuditTypeIcon type={log.type} />
                  </div>
                  <p className="text-xs font-bold leading-none">{log.action}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {log.actor} • {log.recordedAt?.seconds ? format(log.recordedAt.seconds * 1000, "HH:mm") : "..."}
                  </p>
                </div>
              ))}
              {localAuditLogs.length === 0 && (
                <div className="pt-20 text-center text-xs text-muted-foreground italic opacity-50">
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
