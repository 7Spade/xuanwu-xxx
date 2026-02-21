// [職責] Canonical create-workspace route — full-page fallback for direct URL access
"use client"

import { useRouter } from "next/navigation"
import { CreateWorkspaceDialog } from "@/features/workspace-core"

export default function NewWorkspacePage() {
  const router = useRouter()

  return (
    <CreateWorkspaceDialog
      open
      onOpenChange={(open: boolean) => !open && router.back()}
    />
  )
}
