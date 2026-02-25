/**
 * @fileoverview AccountScheduleSection - Organization-wide schedule view.
 * @description Aggregated view of all proposed and official schedule items across all
 * workspaces. Includes an org-only guard and uses the `useScheduleActions` hook for
 * all write operations (approve/reject/assign).
 */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, UserPlus, Calendar, ListChecks, History } from "lucide-react";
import { toast } from "@/shared/utility-hooks/use-toast";
import type { ScheduleItem } from "@/shared/types";
import { UnifiedCalendarGrid } from "./unified-calendar-grid";
import { ScheduleDataTable } from "./schedule-data-table";
import { GovernanceSidebar } from "./governance-sidebar";
import { useGlobalSchedule } from "../_hooks/use-global-schedule";
import { decisionHistoryColumns } from "./decision-history-columns";
import { upcomingEventsColumns } from "./upcoming-events-columns";
import { addMonths, subMonths } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/shadcn-ui/dropdown-menu";
import { Button } from "@/shared/shadcn-ui/button";
import { useScheduleActions } from "../_hooks/use-schedule-commands";
import { useApp } from "@/shared/app-providers/app-context";

export function AccountScheduleSection() {
  const { state } = useApp();
  const { activeAccount } = state;
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { allItems, pendingProposals, decisionHistory, upcomingEvents, presentEvents, organizationMembers } = useGlobalSchedule();
  const { assignMember, unassignMember, approveItem, rejectItem } = useScheduleActions();

  const handleAction = useCallback(async (item: ScheduleItem, newStatus: 'OFFICIAL' | 'REJECTED') => {
    try {
      if (newStatus === 'OFFICIAL') {
        await approveItem(item);
      } else {
        await rejectItem(item);
      }
      const successTitle = newStatus === 'OFFICIAL' ? "Proposal Approved" : "Proposal Rejected";
      toast({ title: successTitle, description: `"${item.title}" has been updated.` });
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Action Failed", description: e instanceof Error ? e.message : "An unknown error occurred." });
    }
  }, [approveItem, rejectItem]);

  const approveProposal = (item: ScheduleItem) => handleAction(item, 'OFFICIAL');
  const rejectProposal = (item: ScheduleItem) => handleAction(item, 'REJECTED');

  const onItemClick = (item: ScheduleItem) => {
    router.push(`/workspaces/${item.workspaceId}?capability=schedule`);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
  };

  const renderItemActions = useCallback((item: ScheduleItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-5 text-muted-foreground hover:text-primary">
          <UserPlus className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>Assign Member</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizationMembers.map(member => (
          <DropdownMenuCheckboxItem
            key={member.id}
            checked={item.assigneeIds.includes(member.id)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => {
              if (item.assigneeIds.includes(member.id)) {
                unassignMember(item, member.id);
              } else {
                assignMember(item, member.id);
              }
            }}
          >
            {member.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ), [organizationMembers, assignMember, unassignMember]);

  if (activeAccount?.accountType !== "organization") {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <AlertCircle className="size-10 text-muted-foreground" />
        <h3 className="font-bold">Schedule Not Available</h3>
        <p className="text-sm text-muted-foreground">
          The organization-wide schedule is only available within an organization dimension.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-full flex-col duration-700 animate-in fade-in">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-bold tracking-tight">Organization Schedule</h1>
          <p className="text-muted-foreground">
            Aggregated view of all proposed and official schedule items across all workspaces.
          </p>
        </div>
      </div>

      <div className="flex h-full flex-col gap-8">
        <div className="flex min-h-[60vh] flex-1 flex-col overflow-hidden rounded-xl border bg-card md:flex-row">
          <div className="flex flex-col md:flex-[2] xl:flex-[3]">
            <div className="relative flex-1 overflow-hidden">
              <UnifiedCalendarGrid
                items={allItems}
                members={organizationMembers}
                viewMode="organization"
                currentDate={currentDate}
                onMonthChange={handleMonthChange}
                onItemClick={onItemClick}
                onApproveProposal={approveProposal}
                onRejectProposal={rejectProposal}
                renderItemActions={renderItemActions}
              />
            </div>
          </div>
          <div className="flex min-w-[300px] flex-col border-t md:flex-[1] md:border-l md:border-t-0">
            <GovernanceSidebar
              proposals={pendingProposals}
              onApprove={approveProposal}
              onReject={rejectProposal}
            />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <Calendar className="size-4" />
              Future Events
            </h3>
            <ScheduleDataTable columns={upcomingEventsColumns} data={upcomingEvents} />
          </div>
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <ListChecks className="size-4" />
              Present Events
            </h3>
            <ScheduleDataTable columns={upcomingEventsColumns} data={presentEvents} />
          </div>
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <History className="size-4" />
              Decision History (Last 7 Days)
            </h3>
            <ScheduleDataTable columns={decisionHistoryColumns} data={decisionHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
