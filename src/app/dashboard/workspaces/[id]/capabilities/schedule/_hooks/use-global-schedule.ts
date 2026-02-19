// @/app/dashboard/workspaces/[id]/capabilities/schedule/_hooks/use-global-schedule.ts
"use client";

import { useMemo } from "react";
import { useAccount } from "@/hooks/state/use-account";
import { useApp } from "@/hooks/state/use-app";
import { subDays, isFuture, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * @fileoverview useGlobalSchedule - Hook for filtering and preparing schedule data for the account view.
 * @description Encapsulates all data manipulation logic for the organization-level
 * schedule, keeping the main component clean and focused on rendering.
 */
export function useGlobalSchedule() {
  const { state: appState } = useApp();
  const { state: accountState } = useAccount();
  const { workspaces, schedule_items } = accountState;
  const { accounts, activeAccount } = appState;

  const activeOrg = useMemo(() =>
    activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  );

  const orgMembers = useMemo(() => activeOrg?.members || [], [activeOrg]);

  const allItems = useMemo(() => {
    return Object.values(schedule_items || {}).map(item => ({
      ...item,
      workspaceName: workspaces[item.workspaceId]?.name || "Unknown Workspace",
    }));
  }, [schedule_items, workspaces]);

  const pendingProposals = useMemo(() => {
    return allItems.filter(item => item.status === 'PROPOSAL');
  }, [allItems]);

  const decisionHistory = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    return allItems
      .filter(item => 
        (item.status === 'OFFICIAL' || item.status === 'REJECTED') && 
        item.updatedAt?.toDate() > sevenDaysAgo
      )
      .sort((a,b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  }, [allItems]);

  const upcomingEvents = useMemo(() => {
    return allItems
      .filter(item => 
        item.status === 'OFFICIAL' && 
        item.startDate &&
        isFuture(item.startDate.toDate())
      )
      .map(item => ({
        ...item,
        members: orgMembers,
      }))
      .sort((a,b) => (a.startDate?.seconds || 0) - (b.startDate?.seconds || 0));
  }, [allItems, orgMembers]);

  const presentEvents = useMemo(() => {
    const today = new Date();
    return allItems
      .filter(item => {
          if (item.status !== 'OFFICIAL' || !item.startDate) return false;
          const start = item.startDate.toDate();
          const end = item.endDate?.toDate() || start;
          return isWithinInterval(today, { start: startOfDay(start), end: endOfDay(end) });
      })
      .map(item => ({
        ...item,
        members: orgMembers,
      }))
      .sort((a,b) => (a.startDate?.seconds || 0) - (b.startDate?.seconds || 0));
  }, [allItems, orgMembers]);

  return { allItems, pendingProposals, decisionHistory, upcomingEvents, presentEvents, orgMembers };
}
