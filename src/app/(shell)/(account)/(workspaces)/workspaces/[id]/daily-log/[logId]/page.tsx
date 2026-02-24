// Canonical route: direct URL access to a daily log entry.
// Renders a standalone full-page view when navigating outside the workspace layout
// or when the intercepting route is not active (e.g., hard refresh, direct URL).
"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/shadcn-ui/button"
import { DailyLogDialog } from "@/features/workspace-business.daily"
import { useAccount } from "@/features/workspace-core"
import { useAuth } from "@/shared/app-providers/auth-provider"

interface PageProps {
  params: Promise<{ id: string; logId: string }>
}

export default function DailyLogPage({ params }: PageProps) {
  const { id: workspaceId, logId } = use(params)
  const router = useRouter()
  const { state: accountState } = useAccount()
  const { state: authState } = useAuth()

  const log =
    accountState.dailyLogs
      ? Object.values(accountState.dailyLogs).find((l) => l.id === logId) ?? null
      : null

  const currentUser = authState.user

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-[10px] font-bold uppercase tracking-widest"
        onClick={() => router.push(`/workspaces/${workspaceId}/daily`)}
      >
        <ArrowLeft className="size-3.5" /> Back to Daily
      </Button>
      <DailyLogDialog
        log={log}
        currentUser={currentUser}
        isOpen={true}
        onOpenChange={(open) => {
          if (!open)
            router.push(`/workspaces/${workspaceId}/daily`)
        }}
      />
    </div>
  )
}
