"use client";

import { useApp } from "@/hooks/state/use-app";
import { AlertCircle } from "lucide-react";
import { AccountScheduleComponent } from "./schedule.account";

export default function AccountScheduleView() {
  const { state } = useApp();
  const { activeAccount } = state;

  if (activeAccount?.accountType !== 'organization') {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <h3 className="font-bold">Schedule Not Available</h3>
        <p className="text-sm text-muted-foreground">
          The organization-wide schedule is only available within an organization dimension.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-full mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight font-headline">Organization Schedule</h1>
          <p className="text-muted-foreground">Aggregated view of all proposed and official schedule items across all workspaces.</p>
        </div>
      </div>
      <AccountScheduleComponent />
    </div>
  );
}
