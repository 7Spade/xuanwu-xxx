// [職責] 詳情頁入口：重定向到默認能力。
"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

/**
 * WorkspaceDetailPage - The entry point for a specific workspace.
 * Its SOLE RESPONSIBILITY is to redirect to the default capability (capabilities).
 */
export default function WorkspaceDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/dashboard/workspaces/${id}/capabilities`)
  }, [id, router])

  return null
}
