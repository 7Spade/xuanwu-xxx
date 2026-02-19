
"use client";

import { OrganizationDailyComponent } from "./daily.component";
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
 * AccountDailyPage - Responsibility: The dynamic wall for the entire dimension.
 * REFACTORED: Now composes the OrganizationDailyComponent to separate concerns.
 */
export default function AccountDailyPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <PageHeader
        title="Daily"
        description="Aggregated activity from all personnel across all spaces."
      />
      <OrganizationDailyComponent />
    </div>
  );
}
