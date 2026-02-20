// [職責] @modal intercept: create workspace dialog (deep-linkable)
"use client"

import { useRouter } from "next/navigation"
import { CreateWorkspaceDialog } from "../../_route-components/create-workspace-dialog"

export default function NewWorkspaceModalPage() {
  const router = useRouter()

  return (
    <CreateWorkspaceDialog
      open
      onOpenChange={(open: boolean) => !open && router.back()}
    />
  )
}
