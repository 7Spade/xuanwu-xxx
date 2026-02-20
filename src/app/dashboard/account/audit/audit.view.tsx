"use client";

import { AccountAuditComponent } from "@/app/dashboard/workspaces/[id]/capabilities/audit/audit.account";

/**
 * AccountAuditView - Responsibility: Displays the audit trail (Audit Logs) for the entire dimension.
 */
export default function AccountAuditView() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight font-headline">Audit</h1>
          <p className="text-muted-foreground">Architectural event log for the entire dimension.</p>
        </div>
      </div>
      <AccountAuditComponent />
    </div>
  );
}
