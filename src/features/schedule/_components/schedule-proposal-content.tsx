// [職責] Shared schedule proposal form logic for both canonical and intercepting routes.
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useWorkspace } from "@/react-providers/workspace-provider"
import { toast } from "@/shared/utility-hooks/use-toast"
import type { ScheduleItem, Location } from "@/shared/types"
import { parseISO } from "date-fns"
import { ProposalDialog } from "./proposal-dialog"

interface ScheduleProposalContentProps {
  /** Wrap the dialog in a full-page centering container (for canonical route). */
  fullPage?: boolean
}

export function ScheduleProposalContent({ fullPage = false }: ScheduleProposalContentProps) {
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

  const dialog = (
    <ProposalDialog
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) router.back()
      }}
      onSubmit={handleSubmit}
      initialDate={initialDate}
    />
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {dialog}
      </div>
    )
  }

  return dialog
}
