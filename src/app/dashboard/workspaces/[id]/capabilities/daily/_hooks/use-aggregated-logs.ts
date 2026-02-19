// @/app/dashboard/account/daily/_hooks/use-aggregated-logs.ts
/**
 * @fileoverview useAggregatedLogs - Hook for fetching and memoizing daily logs.
 * @description This hook is responsible for retrieving all daily logs for the
 * currently active organization from the `AccountContext`. It also handles
 * sorting the logs by date to ensure the daily log wall is displayed in the
 * correct chronological order.
 *
 * @responsibility
 * - Access `dailyLogs` from `useAccount` context.
 * - Memoize the transformation of the logs from a record to a sorted array.
 * - Provide a stable, sorted array of logs for the `OrganizationDailyComponent`.
 */
"use client";

import { useMemo } from "react";
import { useAccount } from "@/hooks/state/use-account";
import { DailyLog } from "@/types/domain";

export function useAggregatedLogs() {
  const { state: accountState } = useAccount();
  const { dailyLogs } = accountState;

  const logs = useMemo(() =>
    Object.values(dailyLogs as Record<string, DailyLog>)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
    [dailyLogs]
  );

  // In a more complex scenario, this hook could also handle pagination,
  // filtering, or other data manipulations.
  
  return { logs };
}
