"use client";

import { AccountAuditComponent } from "./audit.account-view";

/**
 * AccountAuditView - Responsibility: Displays the audit trail (Audit Logs) for the entire dimension.
 */
export default function AccountAuditView() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 duration-700 animate-in fade-in">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-bold tracking-tight">Audit</h1>
          <p className="text-muted-foreground">Architectural event log for the entire dimension.</p>
        </div>
      </div>
      <AccountAuditComponent />
    </div>
  );
}
