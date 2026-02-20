// Intercepting route: renders ProposalDialog in the @modal slot when navigating
// to /dashboard/workspaces/[id]/schedule-proposal from within the workspace layout.
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ProposalDialog } from "@/app/dashboard/workspaces/[id]/plugins/schedule/_plugin-components/proposal-dialog"
import { useWorkspace } from "@/react-providers/workspace-provider"
import { toast } from "@/shared/utility-hooks/use-toast"
import type { ScheduleItem, Location } from "@/domain-types/domain"
import { parseISO } from "date-fns"

export default function ScheduleProposalModalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { workspace, createScheduleItem } = useWorkspace()

  const dateParam = searchParams.get("date")
  const initialDate = dateParam ? parseISO(dateParam) : new Date()

  const handleSubmit = async (data: {
    title: string
    description?: string
    startDate?: Date
    endDate?: Date
    location: Location
  }) => {
    await createScheduleItem({
      accountId: workspace.dimensionId,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      title: data.title.trim(),
      description: data.description?.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      status: "PROPOSAL",
      originType: "MANUAL",
      assigneeIds: [],
    } as Omit<ScheduleItem, "id" | "createdAt" | "updatedAt">)
    toast({
      title: "Schedule Proposal Sent",
      description: "Your request has been sent for organization approval.",
    })
    router.back()
  }

  return (
    <ProposalDialog
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) router.back()
      }}
      onSubmit={handleSubmit}
      initialDate={initialDate}
    />
  )
}
