// [職責] 詳情頁入口：重定向到默認能力。
import { redirect } from "next/navigation"

/**
 * WorkspaceDetailPage - The entry point for a specific workspace.
 * Its SOLE RESPONSIBILITY is to redirect to the default capability (capabilities).
 * Server-side redirect — no client JS required.
 */
export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/workspaces/${id}/capabilities`)
}
