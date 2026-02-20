// Intercepting route: renders DailyLogDialog in the @modal slot when navigating
// to /dashboard/workspaces/[id]/daily-log/[logId] from within the workspace layout.
"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { DailyLogDialog } from "@/app/dashboard/workspaces/[id]/capabilities/daily/_components/daily-log-dialog"
import { useAccount } from "@/hooks/state/use-account"
import { useAuth } from "@/shared/context/auth-context"

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
