// [職責] Canonical workspace settings route — full-page fallback for direct URL access
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WorkspaceSettingsDialog } from "@/features/workspace"
import { useWorkspace } from "@/features/workspace"
import type { WorkspaceLifecycleState, Address } from "@/shared/types"

export default function WorkspaceSettingsPage() {
  const router = useRouter()
  const { workspace, updateWorkspaceSettings } = useWorkspace()
  const [loading, setLoading] = useState(false)

  const onSave = async (settings: {
    name: string
    visibility: "visible" | "hidden"
    lifecycleState: WorkspaceLifecycleState
    address?: Address
  }) => {
    setLoading(true)
    await updateWorkspaceSettings(settings)
    setLoading(false)
    router.back()
  }

  return (
    <WorkspaceSettingsDialog
      workspace={workspace}
      open
      onOpenChange={(open) => !open && router.back()}
      onSave={onSave}
      loading={loading}
    />
  )
}
