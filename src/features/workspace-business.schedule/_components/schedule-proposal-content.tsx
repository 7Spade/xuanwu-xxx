// [職責] Shared schedule proposal form logic for both canonical and intercepting routes.
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useWorkspace } from "@/features/workspace-core"
import { toast } from "@/shared/utility-hooks/use-toast"
import type { ScheduleItem, Location, SkillRequirement } from "@/shared/types"
import { parseISO } from "date-fns"
import { ProposalDialog } from "./proposal-dialog"
import { Timestamp } from "firebase/firestore"

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
    requiredSkills: SkillRequirement[]
  }) => {
    await createScheduleItem({
      accountId: workspace.dimensionId,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      title: data.title.trim(),
      startDate: data.startDate ? Timestamp.fromDate(data.startDate) : Timestamp.now(),
      endDate: data.endDate ? Timestamp.fromDate(data.endDate) : Timestamp.now(),
      location: data.location,
      status: "PROPOSAL",
      originType: "MANUAL",
      assigneeIds: [],
      // Omit optional fields rather than passing undefined — Firestore rejects undefined values.
      ...(data.description?.trim() ? { description: data.description.trim() } : {}),
      ...(data.requiredSkills.length > 0 ? { requiredSkills: data.requiredSkills } : {}),
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
      <div className="flex min-h-[60vh] items-center justify-center">
        {dialog}
      </div>
    )
  }

  return dialog
}
