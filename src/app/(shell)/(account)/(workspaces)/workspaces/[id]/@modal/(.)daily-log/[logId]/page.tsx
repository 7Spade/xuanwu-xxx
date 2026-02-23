// Intercepting route: renders DailyLogDialog in the @modal slot when navigating
// to /workspaces/[id]/daily-log/[logId] from within the workspace layout.
"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { DailyLogDialog } from "@/features/workspace-business.daily"
import { useAccount } from "@/features/workspace-core"
import { useAuth } from "@/shared/app-providers/auth-provider"

interface PageProps {
  params: Promise<{ id: string; logId: string }>
}

export default function DailyLogModalPage({ params }: PageProps) {
  const { logId } = use(params)
  const router = useRouter()
  const { state: accountState } = useAccount()
  const { state: authState } = useAuth()

  const log =
    accountState.dailyLogs
      ? Object.values(accountState.dailyLogs).find((l) => l.id === logId) ?? null
      : null

  const currentUser = authState.user

  return (
    <DailyLogDialog
      log={log}
      currentUser={currentUser}
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) router.back()
      }}
    />
  )
}
