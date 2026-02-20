// [職責] Canonical governance route — full-page fallback for direct URL access
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/react-providers/workspace-provider"
import { useAccount } from "@/react-hooks/state-hooks/use-account"
import { GovernanceSidebar } from "@/view-modules/workspaces/plugins/schedule/_plugin-components/governance-sidebar"
import { useScheduleActions } from "@/react-hooks/command-hooks/use-schedule-commands"
import type { ScheduleItem } from "@/domain-types/domain"

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
    <div className="max-w-2xl mx-auto py-8">
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
