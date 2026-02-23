"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type MemberReference, type ScheduleItem } from "@/shared/types"
import { Avatar, AvatarFallback } from "@/shared/shadcn-ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/shadcn-ui/tooltip"
import { format } from "date-fns"
import { Button } from "@/shared/shadcn-ui/button"
import { ArrowUpDown } from "lucide-react"

export type UpcomingEventItem = Pick<ScheduleItem, 'id' | 'title' | 'workspaceName' | 'startDate' | 'endDate' | 'assigneeIds'> & { members: MemberReference[] }

export const upcomingEventsColumns: ColumnDef<UpcomingEventItem>[] = [
  {
    accessorKey: "startDate",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
        const start = row.original.startDate?.toDate ? row.original.startDate.toDate() : null
        const end = row.original.endDate?.toDate ? row.original.endDate.toDate() : null
        if (!start) return "N/A"
        if (!end || format(start, "PPP") === format(end, "PPP")) return format(start, "PPP")
        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
    }
  },
  {
    accessorKey: "workspaceName",
    header: "Workspace",
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "assignees",
    header: "Assignees",
    cell: ({ row }) => {
      const assignees = row.original.assigneeIds || []
      const members = row.original.members || []
      
      const assigneeDetails = assignees.map(id => members.find(m => m.id === id)).filter(Boolean) as MemberReference[];

      if (assigneeDetails.length === 0) {
        return <span className="text-[10px] italic text-muted-foreground/50">Unassigned</span>
      }

      return (
        <div className="flex -space-x-2">
            {assigneeDetails.slice(0, 3).map(member => (
              member &&
              <TooltipProvider key={member.id}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Avatar className="size-7 border-2 border-background">
                            <AvatarFallback className="text-[10px] font-bold">{member.name?.[0]}</AvatarFallback>
                        </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{member.name}</p>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {assigneeDetails.length > 3 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Avatar className="size-7 border-2 border-background">
                                <AvatarFallback className="text-[10px] font-bold">+{assignees.length - 3}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>{assigneeDetails.slice(3).map(m => m.name).join(', ')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
      )
    }
  },
]
