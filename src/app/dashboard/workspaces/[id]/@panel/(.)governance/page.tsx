// [職責] @panel intercept: governance sidebar — pending proposals review panel
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/shadcn-ui/sheet"
import { useWorkspace } from "@/react-providers/workspace-provider"
import { useAccount } from "@/react-hooks/state-hooks/use-account"
import { GovernanceSidebar } from "../../plugins/schedule/_route-components/governance-sidebar"
import { approveScheduleItem, rejectScheduleItem } from "@/use-cases/schedule"
import type { ScheduleItem } from "@/domain-types/domain"

export default function GovernancePanelPage() {
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
    <Sheet open onOpenChange={(open) => !open && router.back()}>
      <SheetContent side="right" className="w-[380px] p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Governance Panel</SheetTitle>
        </SheetHeader>
        <GovernanceSidebar
          proposals={proposals}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </SheetContent>
    </Sheet>
  )
}
