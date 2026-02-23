
"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type ScheduleItem } from "@/shared/types"
import { Badge } from "@/shared/shadcn-ui/badge"
import { CheckCircle, XCircle, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/shared/shadcn-ui/button"

export type DecisionHistoryItem = Pick<ScheduleItem, 'id' | 'title' | 'workspaceName' | 'status' | 'updatedAt'>

export const decisionHistoryColumns: ColumnDef<DecisionHistoryItem>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Proposal
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "workspaceName",
    header: "Workspace",
  },
  {
    accessorKey: "status",
    header: "Decision",
    cell: ({ row }) => {
      const status = row.original.status
      if (status === "OFFICIAL") {
        return <Badge variant="secondary" className="border-green-500/20 bg-green-500/10 text-green-700"><CheckCircle className="mr-1 size-3"/>Approved</Badge>
      }
      if (status === "REJECTED") {
         return <Badge variant="destructive" className="border-red-500/20 bg-red-500/10 text-red-700"><XCircle className="mr-1 size-3"/>Rejected</Badge>
      }
      return <Badge variant="outline">{status}</Badge>
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Handled At
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
        const date = row.original.updatedAt?.toDate ? row.original.updatedAt.toDate() : null
        return date ? format(date, "MMM d, yyyy") : "N/A"
    }
  },
]
