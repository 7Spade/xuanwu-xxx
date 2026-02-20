// [職責] Projection — Account 層跨 Workspace 排程治理視圖 (全維度、可審批)
/**
 * @fileoverview AccountScheduleComponent - The "Governor" view for the account-wide schedule.
 * @description Aggregated view of all proposed and official schedule items across all workspaces.
 * Uses the `useScheduleActions` hook to handle all write operations (approve/reject/assign).
 */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/shared/hooks/use-toast";
import { ScheduleItem } from "@/types/domain";
import { UnifiedCalendarGrid } from "./_components/unified-calendar-grid";
import { ScheduleDataTable } from "./_components/schedule-data-table";
import { GovernanceSidebar } from "./_components/governance-sidebar";
import { useGlobalSchedule } from "./_hooks/use-global-schedule";
import { decisionHistoryColumns } from "./_components/decision-history-columns";
import { upcomingEventsColumns } from "./_components/upcoming-events-columns";
import { addMonths, subMonths } from "date-fns";
import { approveScheduleItem, rejectScheduleItem } from "@/features/schedule";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { UserPlus, Calendar, ListChecks, History } from "lucide-react";
import { useScheduleActions } from "@/hooks/actions/use-schedule-actions";

export function AccountScheduleComponent() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { allItems, pendingProposals, decisionHistory, upcomingEvents, presentEvents, orgMembers } = useGlobalSchedule();
  const { assignMember, unassignMember } = useScheduleActions();

  const handleAction = useCallback(async (item: ScheduleItem, newStatus: 'OFFICIAL' | 'REJECTED') => {
    try {
      if (newStatus === 'OFFICIAL') {
        await approveScheduleItem(item)
      } else {
        await rejectScheduleItem(item)
      }
      const successTitle = newStatus === 'OFFICIAL' ? "Proposal Approved" : "Proposal Rejected";
      toast({ title: successTitle, description: `"${item.title}" has been updated.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed", description: e.message });
    }
  }, []);

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
                onSelect={(e) => e.preventDefault()} // Prevents menu from closing
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

  return (
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
  );
}
