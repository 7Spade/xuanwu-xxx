"use client";

import { OrganizationAuditComponent } from "@/app/dashboard/workspaces/[id]/capabilities/audit/organization-audit.component";
import { PageHeader } from "../_components/page-header";

/**
 * AccountAuditView - Responsibility: Displays the audit trail (Audit Logs) for the entire dimension.
 */
export default function AccountAuditView() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <PageHeader
        title="Audit"
        description="Architectural event log for the entire dimension."
      />
      <OrganizationAuditComponent />
    </div>
  );
}
