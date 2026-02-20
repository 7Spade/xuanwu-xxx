// Canonical route: full-page schedule proposal form for direct URL access.
// When navigated to within the workspace layout, the @modal slot intercepts.
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ProposalDialog } from "../capabilities/schedule/_components/proposal-dialog"
import { useWorkspace } from "@/context/workspace-context"
import { toast } from "@/shared/hooks/use-toast"
import type { ScheduleItem, Location } from "@/types/domain"
import { parseISO } from "date-fns"

export default function ScheduleProposalPage() {
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <ProposalDialog
        isOpen={true}
        onOpenChange={(open) => {
          if (!open) router.back()
        }}
        onSubmit={handleSubmit}
        initialDate={initialDate}
      />
    </div>
  )
}
