/**
 * @fileoverview entities/workspace — Pure workspace domain rules.
 * No async, no I/O, no React, no Firebase.
 */

import type { Workspace, Account } from "@/shared/types"
import { isOwner, getUserTeamIds } from "@/shared/lib/account.rules"

// ---------------------------------------------------------------------------
// Access predicates
// ---------------------------------------------------------------------------

/**
 * Returns true if the user has explicit access to the workspace
 * either via a direct individual grant or via a team grant.
 */
export function hasWorkspaceAccess(
  workspace: Workspace,
  userId: string,
  userTeamIds: Set<string>
): boolean {
  const hasDirectGrant = (workspace.grants ?? []).some(
    (g) => g.userId === userId && g.status === "active"
  )
  const hasTeamGrant = (workspace.teamIds ?? []).some((teamId) =>
    userTeamIds.has(teamId)
  )
  return hasDirectGrant || hasTeamGrant
}

/**
 * Returns true if the workspace should be visible to the given user,
 * taking into account the workspace's visibility setting and the
 * user's grants / team memberships.
 */
export function isWorkspaceVisibleToUser(
  workspace: Workspace,
  userId: string,
  userTeamIds: Set<string>
): boolean {
  if (workspace.visibility === "visible") return true
  if (workspace.visibility === "hidden") {
    return hasWorkspaceAccess(workspace, userId, userTeamIds)
  }
  return false
}

// ---------------------------------------------------------------------------
// Collection filter
// ---------------------------------------------------------------------------

/**
 * Returns the subset of workspaces that are visible to the given user
 * in the context of the active account.
 *
 * Business rules:
 * - Personal accounts: user sees all workspaces they own.
 * - Organization accounts: org owners see everything;
 *   regular members see workspaces where visibility='visible'
 *   OR they have an explicit grant / team membership.
 */
export function filterVisibleWorkspaces(
  workspaces: Workspace[],
  userId: string,
  activeAccount: Account,
  allAccounts: Record<string, Account>
): Workspace[] {
  // Filter to workspaces that belong to the active dimension
  const accountWorkspaces = workspaces.filter(
    (workspace) => workspace.dimensionId === activeAccount.id
  )

  // Personal account: the user owns all of their own workspaces
  if (activeAccount.accountType === "user") {
    return accountWorkspaces
  }

  // Organization account: apply visibility + access rules
  if (activeAccount.accountType === "organization") {
    const activeOrganization = allAccounts[activeAccount.id]
    if (!activeOrganization) return []

    // Org owners see everything in their org
    if (isOwner(activeOrganization, userId)) {
      return accountWorkspaces
    }

    const userTeamIds = getUserTeamIds(activeOrganization, userId)

    return accountWorkspaces.filter((workspace) =>
      isWorkspaceVisibleToUser(workspace, userId, userTeamIds)
    )
  }

  return []
}
