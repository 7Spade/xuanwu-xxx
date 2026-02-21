/**
 * @fileoverview files.commands.ts — Read-only actions for workspace file retrieval.
 * @description Provides server-side read functions for fetching workspace file manifests.
 * Callable from RSC pages, hooks, and context without React dependencies.
 */

import {
  getWorkspaceFiles as getWorkspaceFilesFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { WorkspaceFile } from "@/shared/types"

/**
 * Retrieves the file manifest for a workspace.
 * @param workspaceId The ID of the workspace.
 */
export async function getWorkspaceFiles(
  workspaceId: string
): Promise<WorkspaceFile[]> {
  return getWorkspaceFilesFacade(workspaceId)
}
