/**
 * @fileoverview features/workspace — Multi-step workspace use cases.
 * No React. No UI. Callable from hooks, context, or Server Actions.
 */

import { createWorkspace, mountCapabilities , updateWorkspaceSettings, deleteWorkspace } from "./_actions"
import type { Account, Capability , WorkspaceLifecycleState, Address } from "@/shared/types"

/**
 * Creates a workspace and immediately mounts a set of initial capabilities.
 * Combines two action calls into one atomic use case.
 *
 * @param name         Workspace name
 * @param account      The owning account
 * @param capabilities Initial capabilities to mount (may be empty)
 * @returns            The new workspace ID
 */
export async function createWorkspaceWithCapabilities(
  name: string,
  account: Account,
  capabilities: Capability[] = []
): Promise<string> {
  const workspaceId = await createWorkspace(name, account)
  if (capabilities.length > 0) {
    await mountCapabilities(workspaceId, capabilities)
  }
  return workspaceId
}

import { toast } from "@/shared/utility-hooks/use-toast"

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export const handleCreateWorkspace = async (
  name: string,
  activeAccount: Account | null,
  onSuccess: () => void,
  t: (key: string) => string
) => {
  if (!name.trim() || !activeAccount) {
    toast({ variant: "destructive", title: t("workspaces.creationFailed"), description: t("workspaces.accountNotFound") })
    return
  }
  try {
    await createWorkspace(name, activeAccount)
    toast({ title: t("workspaces.logicalSpaceCreated"), description: t("workspaces.spaceSynchronized").replace("{name}", name) })
    onSuccess()
  } catch (error: unknown) {
    console.error("Error creating workspace:", error)
    toast({ variant: "destructive", title: t("workspaces.failedToCreateSpace"), description: getErrorMessage(error, t("common.unknownError")) })
  }
}

export const handleUpdateWorkspaceSettings = async (
  workspaceId: string,
  settings: { name: string; visibility: 'visible' | 'hidden'; lifecycleState: WorkspaceLifecycleState; address?: Address },
  onSuccess: () => void
) => {
  try {
    await updateWorkspaceSettings(workspaceId, settings)
    toast({ title: "Space settings synchronized" })
    onSuccess()
  } catch (error) {
    console.error("Error updating settings:", error)
    toast({ variant: "destructive", title: "Failed to Update Settings", description: getErrorMessage(error, "An unknown error occurred.") })
  }
}

export const handleDeleteWorkspace = async (workspaceId: string, onSuccess: () => void) => {
  try {
    await deleteWorkspace(workspaceId)
    toast({ title: "Workspace node destroyed" })
    onSuccess()
  } catch (error) {
    console.error("Error deleting workspace:", error)
    toast({ variant: "destructive", title: "Failed to Destroy Space", description: getErrorMessage(error, "An unknown error occurred.") })
  }
}
