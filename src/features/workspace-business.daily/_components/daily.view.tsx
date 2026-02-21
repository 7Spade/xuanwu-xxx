"use client";

import { AccountDailyComponent } from "./daily.account-view";

/**
 * AccountDailyView - Responsibility: The dynamic wall for the entire dimension.
 */
export default function AccountDailyView() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 duration-700 animate-in fade-in">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-bold tracking-tight">Daily</h1>
          <p className="text-muted-foreground">Aggregated activity from all personnel across all spaces.</p>
        </div>
      </div>
      <AccountDailyComponent />
    </div>
  );
}
