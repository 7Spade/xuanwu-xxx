// [職責] 組織視圖 (全寬度時間軸)
"use client";

import { useApp } from "@/hooks/state/use-app";
import { useAccount } from "@/hooks/state/use-account";
import { useMemo, useState } from "react";
import { AlertCircle, Terminal } from "lucide-react";
import { AuditLog } from "@/types/domain";
import { AuditTimeline } from "@/app/dashboard/_components/audit/audit-timeline";
import { AuditEventItem } from "@/app/dashboard/_components/audit/audit-event-item";
import { AuditDetailSheet } from "@/app/dashboard/_components/audit/audit-detail-sheet";

export function OrganizationAuditComponent() {
  const { state: appState } = useApp();
  const { state: accountState } = useAccount();
  const { activeAccount } = appState;
  const { auditLogs } = accountState;
  const logsArray = useMemo(() => Object.values(auditLogs), [auditLogs]);
  
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (activeAccount?.type !== 'organization') {
     return (
        <div className="p-8 text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
            <h3 className="font-bold">Audit Log Not Available</h3>
            <p className="text-sm text-muted-foreground">
                Audit logs are only available within an organization dimension.
            </p>
        </div>
      )
  }

  return (
    <>
      {logsArray && logsArray.length > 0 ? (
        <AuditTimeline>
          {logsArray.map((log) => (
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
        onOpenChange={(open) => { if (!open) setSelectedLog(null); }}
      />
    </>
  );
}
