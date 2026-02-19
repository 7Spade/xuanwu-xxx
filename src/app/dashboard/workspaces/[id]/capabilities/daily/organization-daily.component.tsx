// @/app/dashboard/workspaces/[id]/capabilities/daily/organization-daily.component.tsx
/**
 * @fileoverview OrganizationDailyComponent - The main view for the aggregated daily log wall.
 * @description This component is a "smart" container that fetches aggregated logs
 * and manages the state for the detail-view dialog. It arranges `DailyLogCard`
 * components in a masonry-style layout.
 *
 * @responsibility
 * - Fetches and sorts all daily logs for the organization using the `useAggregatedLogs` hook.
 * - Manages the state for the `DailyLogDialog` (which log is selected and if the dialog is open).
 * - Renders the masonry layout for the log cards.
 * - Handles the click event on each card to open the detail dialog.
 */
"use client";

import { useState } from "react";
import { useApp } from "@/hooks/state/use-app";
import { useAuth } from "@/context/auth-context";
import { AlertCircle, MessageSquare } from "lucide-react";
import { DailyLogCard } from "../../../../_components/daily/daily-log-card";
import { useAggregatedLogs } from "./_hooks/use-aggregated-logs";
import { DailyLog } from "@/types/domain";
import { DailyLogDialog } from "../../../../_components/daily/daily-log-dialog";
import { WorkspaceProvider } from "@/context/workspace-context";

export function OrganizationDailyComponent() {
  const { state: appState } = useApp();
  const { state: authState } = useAuth();
  const { user } = authState;
  const { activeAccount } = appState;
  const { logs: dailyLogsArray } = useAggregatedLogs();
  
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

  if (activeAccount?.accountType !== 'organization') {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <h3 className="font-bold">Activity Log Not Available</h3>
        <p className="text-sm text-muted-foreground">
          Daily activity logs are only available within an organization dimension.
        </p>
      </div>
    )
  }

  return (
    <>
      {dailyLogsArray.length > 0 ? (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-20">
          {dailyLogsArray.map(log => (
            <div 
              key={log.id} 
              className="break-inside-avoid mb-6"
            >
              <DailyLogCard 
                log={log} 
                currentUser={user}
                onOpen={() => setSelectedLog(log)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-32 text-center flex flex-col items-center justify-center space-y-6 opacity-30">
          <div className="p-6 bg-muted/20 rounded-full border-2 border-dashed">
            <MessageSquare className="w-16 h-16 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold uppercase tracking-[0.2em]">Activity Void</p>
        </div>
      )}

      {selectedLog && (
        <WorkspaceProvider workspaceId={selectedLog.workspaceId}>
            <DailyLogDialog
                log={selectedLog}
                currentUser={user}
                isOpen={!!selectedLog}
                onOpenChange={(open) => {
                if (!open) {
                    setSelectedLog(null);
                }
                }}
            />
        </WorkspaceProvider>
      )}
    </>
  );
}
