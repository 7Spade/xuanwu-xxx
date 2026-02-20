// [職責] Canonical governance route — full-page fallback for direct URL access
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/react-providers/workspace-provider"
import { useAccount } from "@/react-hooks/state-hooks/use-account"
import { GovernanceSidebar } from "../plugins/schedule/_plugin-components/governance-sidebar"
import { approveScheduleItem, rejectScheduleItem } from "@/use-cases/schedule"
import type { ScheduleItem } from "@/domain-types/domain"

export default function GovernancePage() {
  const router = useRouter()
  const { workspace } = useWorkspace()
  const { state: accountState } = useAccount()

  const proposals = useMemo(() =>
    Object.values(accountState.schedule_items).filter(
      (item: ScheduleItem) => item.workspaceId === workspace.id && item.status === "PROPOSAL"
    ),
    [accountState.schedule_items, workspace.id]
  )

  const handleApprove = async (item: ScheduleItem) => {
    await approveScheduleItem(item)
  }

  const handleReject = async (item: ScheduleItem) => {
    await rejectScheduleItem(item)
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <GovernanceSidebar
        proposals={proposals}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <button
        onClick={() => router.back()}
        className="mt-4 text-xs text-muted-foreground underline"
      >
        ← Back
      </button>
    </div>
  )
}
