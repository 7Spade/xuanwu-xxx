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
import type { ScheduleItem } from "@/domain-types/domain";
import { UnifiedCalendarGrid } from "./_plugin-components/unified-calendar-grid";
import { ScheduleDataTable } from "./_plugin-components/schedule-data-table";
import { GovernanceSidebar } from "./_plugin-components/governance-sidebar";
import { useGlobalSchedule } from "@/react-hooks/state-hooks/use-global-schedule";
import { decisionHistoryColumns } from "./_plugin-components/decision-history-columns";
import { upcomingEventsColumns } from "./_plugin-components/upcoming-events-columns";
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
import { useScheduleActions } from "@/react-hooks/command-hooks/use-schedule-commands";
import { useApp } from "@/react-hooks/state-hooks/use-app";

export function AccountScheduleSection() {
  const { state } = useApp();
  const { activeAccount } = state;
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { allItems, pendingProposals, decisionHistory, upcomingEvents, presentEvents, orgMembers } = useGlobalSchedule();
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
    router.push(`/dashboard/workspaces/${item.workspaceId}?capability=schedule`);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
  };

  const renderItemActions = useCallback((item: ScheduleItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-5 h-5 text-muted-foreground hover:text-primary">
          <UserPlus className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>Assign Member</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgMembers.map(member => (
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
  ), [orgMembers, assignMember, unassignMember]);

  if (activeAccount?.accountType !== "organization") {
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
          <p className="text-muted-foreground">
            Aggregated view of all proposed and official schedule items across all workspaces.
          </p>
        </div>
      </div>

      <div className="flex flex-col h-full gap-8">
        <div className="flex-1 rounded-xl border bg-card overflow-hidden flex flex-col md:flex-row min-h-[60vh]">
          <div className="md:flex-[2] xl:flex-[3] flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              <UnifiedCalendarGrid
                items={allItems}
                members={orgMembers}
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
          <div className="md:flex-[1] min-w-[300px] border-t md:border-t-0 md:border-l flex flex-col">
            <GovernanceSidebar
              proposals={pendingProposals}
              onApprove={approveProposal}
              onReject={rejectProposal}
            />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4" />
              Future Events
            </h3>
            <ScheduleDataTable columns={upcomingEventsColumns} data={upcomingEvents} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
              <ListChecks className="w-4 h-4" />
              Present Events
            </h3>
            <ScheduleDataTable columns={upcomingEventsColumns} data={presentEvents} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
              <History className="w-4 h-4" />
              Decision History (Last 7 Days)
            </h3>
            <ScheduleDataTable columns={decisionHistoryColumns} data={decisionHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
