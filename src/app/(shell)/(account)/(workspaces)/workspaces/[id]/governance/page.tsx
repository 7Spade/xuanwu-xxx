// [職責] Canonical governance route — full-page fallback for direct URL access
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/features/workspace-core"
import { useAccount } from "@/features/workspace-core"
import { GovernanceSidebar , useScheduleActions } from "@/features/workspace-business.schedule"
import type { ScheduleItem } from "@/shared/types"

export default function GovernancePage() {
  const router = useRouter()
  const { workspace } = useWorkspace()
  const { state: accountState } = useAccount()
  const { approveItem, rejectItem } = useScheduleActions()

  const proposals = useMemo(() =>
    Object.values(accountState.schedule_items).filter(
      (item: ScheduleItem) => item.workspaceId === workspace.id && item.status === "PROPOSAL"
    ),
    [accountState.schedule_items, workspace.id]
  )

  return (
    <div className="mx-auto max-w-2xl py-8">
      <GovernanceSidebar
        proposals={proposals}
        onApprove={approveItem}
        onReject={rejectItem}
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
