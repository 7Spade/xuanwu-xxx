// [職責] 組織入口 (頁面外框與標題)
"use client";

import { OrganizationAuditComponent } from "@/app/dashboard/workspaces/[id]/capabilities/audit/organization-audit.component";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  badge?: ReactNode;
}

function PageHeader({ title, description, children, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-4xl font-bold tracking-tight font-headline">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

/**
 * AccountAuditPage - Responsibility: Displays the audit trail (Audit Logs) for the entire dimension.
 */
export default function AccountAuditPage() {
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
