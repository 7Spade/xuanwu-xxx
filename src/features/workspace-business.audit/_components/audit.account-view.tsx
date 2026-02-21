// [職責] Projection — Account 層跨 Workspace 稽核事件流 (全維度、唯讀)
"use client";

import { AlertCircle, Terminal } from "lucide-react";
import { AuditTimeline } from "./audit-timeline";
import { AuditEventItem } from "./audit-event-item";
import { AuditDetailSheet } from "./audit-detail-sheet";
import { useAccountAudit } from "../_hooks/use-account-audit";

export function AccountAuditComponent() {
  const { logs, isOrgContext, selectedLog, setSelectedLog, clearSelection } = useAccountAudit();

  if (!isOrgContext) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <h3 className="font-bold">Audit Log Not Available</h3>
        <p className="text-sm text-muted-foreground">
          Audit logs are only available within an organization dimension.
        </p>
      </div>
    );
  }

  return (
    <>
      {logs.length > 0 ? (
        <AuditTimeline>
          {logs.map((log) => (
            <AuditEventItem key={log.id} log={log} onSelect={() => setSelectedLog(log)} />
          ))}
        </AuditTimeline>
      ) : (
        <div className="p-32 text-center flex flex-col items-center justify-center space-y-4 opacity-30">
          <Terminal className="w-12 h-12" />
          <p className="text-sm font-black uppercase tracking-widest">No technical specification changes recorded</p>
        </div>
      )}

      <AuditDetailSheet
        log={selectedLog}
        isOpen={!!selectedLog}
        onOpenChange={(open) => { if (!open) clearSelection(); }}
      />
    </>
  );
}
