"use client";

import { OrganizationDailyComponent } from "@/app/dashboard/workspaces/[id]/capabilities/daily/organization-daily.component";
import { PageHeader } from "../_components/page-header";

/**
 * AccountDailyView - Responsibility: The dynamic wall for the entire dimension.
 * Composes the OrganizationDailyComponent to separate concerns.
 */
export default function AccountDailyView() {
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
