/**
 * @fileoverview features/workspace — Multi-step workspace use cases.
 * No React. No UI. Callable from hooks, context, or Server Actions.
 */

import { createWorkspace, mountCapabilities } from "@/server-commands/workspace"
import type { Account, Capability } from "@/types/domain"

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
