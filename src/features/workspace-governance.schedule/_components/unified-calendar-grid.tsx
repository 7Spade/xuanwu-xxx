"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { type MemberReference, type ScheduleItem } from "@/shared/types";
import { Button } from "@/shared/shadcn-ui/button";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { Avatar, AvatarFallback } from "@/shared/shadcn-ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/shadcn-ui/tooltip";
import { cn } from "@/shared/utils/utils";
import { format, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths } from "date-fns";
import { Plus, Check, X, Layers, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface UnifiedCalendarGridProps {
  items: ScheduleItem[];
  members: MemberReference[];
  viewMode: 'workspace' | 'organization';
  currentDate: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onItemClick?: (item: ScheduleItem) => void;
  onAddClick?: (date: Date) => void;
  onApproveProposal?: (item: ScheduleItem) => void;
  onRejectProposal?: (item: ScheduleItem) => void;
  renderItemActions?: (item: ScheduleItem) => React.ReactNode;
}

/**
 * @fileoverview UnifiedCalendarGrid - A dumb component for rendering schedule items.
 * @description REFACTORED: This component is now a pure presentation component.
 * It receives all data and callbacks via props and is responsible only for rendering
 * the calendar grid. All state management and dialogs have been moved to parent components.
 */
export function UnifiedCalendarGrid({
  items,
  members,
  viewMode,
  currentDate,
  onMonthChange,
  onItemClick,
  onAddClick,
  onApproveProposal,
  onRejectProposal,
  renderItemActions,
}: UnifiedCalendarGridProps) {
  
  const router = useRouter();

  const membersMap = useMemo(() => 
    new Map<string, MemberReference>(members.map(m => [m.id, m])), 
    [members]
  );
  
  const toDate = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  };
  
  const itemsByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    items.forEach(item => {
      const end = toDate(item.endDate);
      const start = toDate(item.startDate);
      const effectiveEnd = end || start;
      if (effectiveEnd) {
        const dateKey = format(effectiveEnd, 'yyyy-MM-dd');
        const dayItems = map.get(dateKey) || [];
        map.set(dateKey, [...dayItems, item]);
      }
    });
    return map;
  }, [items]);

  const firstDay = startOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: endOfMonth(firstDay) });
  const startingDayIndex = getDay(firstDay);
  const totalCells = Math.ceil((startingDayIndex + daysInMonth.length) / 7) * 7;
  
  return (
     <div className="flex flex-col h-full">
      <div className="flex items-center justify-center gap-4 p-4 border-b">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMonthChange('prev')}>
            <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-center w-48">{format(currentDate, "MMMM yyyy")}</h2>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMonthChange('next')}>
            <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 flex-1">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="border-r border-b p-2 text-center text-xs font-bold text-muted-foreground bg-muted/50">{day}</div>
        ))}
        
        {Array.from({ length: startingDayIndex }).map((_, i) => (
          <div key={`pad-start-${i}`} className="border-r border-b bg-muted/30" />
        ))}
        
        {daysInMonth.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayItems = itemsByDate.get(dateKey) || [];
          
          return (
            <div key={dateKey} className={cn('group relative flex min-h-[140px] flex-col gap-1.5 border-r border-b p-1.5', { 'bg-muted/30': isWeekend(day) })}>
              {viewMode === 'workspace' && onAddClick && (
                <Button variant="ghost" size="icon" className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onAddClick(day)}>
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
              <div className="flex justify-end">
                <div className={cn( 'flex h-6 w-6 items-center justify-center rounded-full text-sm', isToday(day) && 'bg-primary font-bold text-primary-foreground' )}>
                  {format(day, 'd')}
                </div>
              </div>
              <ScrollArea className="flex-grow pr-2">
                <div className="space-y-2">
                  {dayItems.map(item => {
                    const assignedMembers = item.assigneeIds.map(id => membersMap.get(id)).filter(Boolean) as MemberReference[];

                    return (
                        <div 
                            key={item.id} 
                            className={cn(
                                "rounded-lg border text-xs", 
                                item.status === 'PROPOSAL' ? 'border-dashed border-primary/50 bg-primary/5' : 'bg-background shadow-sm'
                            )}
                        >
                            {/* Section 1: Workspace */}
                            {viewMode === 'organization' && (
                                <div 
                                    className="flex items-center gap-1.5 p-1.5 border-b cursor-pointer hover:bg-muted/50 rounded-t-md transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/workspaces/${item.workspaceId}?capability=schedule`);
                                    }}
                                >
                                    <Layers className="w-3 h-3 text-muted-foreground" />
                                    <p className="text-[9px] font-bold text-muted-foreground truncate">{item.workspaceName}</p>
                                </div>
                            )}

                            {/* Section 2: Title */}
                            <div
                                className={cn(
                                    "p-2",
                                    viewMode === 'workspace' && 'rounded-t-md'
                                )}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p className="font-bold truncate cursor-default">{item.title}</p>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{item.title}</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Section 3: Assignees & Actions */}
                            <div className="flex justify-between items-center mt-1 p-2 border-t">
                                <div className="flex -space-x-1">
                                  {assignedMembers.map(m => (
                                    <TooltipProvider key={m.id}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Avatar className="w-5 h-5 border border-background">
                                            <AvatarFallback className="text-[8px] font-bold">{m.name[0]}</AvatarFallback>
                                          </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{m.name}</p></TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                </div>
                                <div className="flex items-center">
                                  {renderItemActions && renderItemActions(item)}
                                  {viewMode === 'organization' && item.status === 'PROPOSAL' && onApproveProposal && onRejectProposal && (
                                    <div className="flex gap-1">
                                        <Button size="xs" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); onRejectProposal(item); }}>
                                            <X className="w-3 h-3"/>
                                        </Button>
                                        <Button size="xs" variant="ghost" className="h-6 w-6 p-0 text-green-600" onClick={(e) => { e.stopPropagation(); onApproveProposal(item); }}>
                                            <Check className="w-3 h-3"/>
                                        </Button>
                                    </div>
                                  )}
                                </div>
                            </div>
                        </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )
        })}
        
        {Array.from({ length: totalCells > (startingDayIndex + daysInMonth.length) ? totalCells - (startingDayIndex + daysInMonth.length) : 0 }).map((_, i) => (
          <div key={`pad-end-${i}`} className="border-r border-b bg-muted/30" />
        ))}
      </div>
    </div>
  );
}
