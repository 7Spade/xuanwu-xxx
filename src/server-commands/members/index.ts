/**
 * @fileoverview members.actions.ts — Read-only actions for workspace member retrieval.
 * @description Provides server-side read functions for fetching workspace access grants.
 * Callable from RSC pages, hooks, and context without React dependencies.
 */

import {
  getWorkspaceGrants as getWorkspaceGrantsFacade,
} from "@/firebase/firestore/firestore.facade"
import type { WorkspaceGrant } from "@/domain-types/domain"

/**
 * Retrieves all access grants for a workspace.
 * @param workspaceId The ID of the workspace.
 */
export async function getWorkspaceGrants(
  workspaceId: string
): Promise<WorkspaceGrant[]> {
  return getWorkspaceGrantsFacade(workspaceId)
}
