/**
 * @fileoverview entities/account — Pure account domain rules.
 * No async, no I/O, no React, no Firebase.
 */

import type { Account, OrganizationRole, Team, MemberReference } from "@/shared/types"

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/** Returns true if the account represents an organization. */
export function isOrganization(account: Account): boolean {
  return account.accountType === "organization"
}

/** Returns true if the account represents a personal user account. */
export function isPersonalAccount(account: Account): boolean {
  return account.accountType === "user"
}

// ---------------------------------------------------------------------------
// Ownership & role queries
// ---------------------------------------------------------------------------

/** Returns true if the given userId is the owner of this organization account. */
export function isOwner(account: Account, userId: string): boolean {
  return account.ownerId === userId
}

/**
 * Returns the OrganizationRole of a member within an account, or undefined
 * if the user is not a member.
 */
export function getMemberRole(
  account: Account,
  userId: string
): OrganizationRole | undefined {
  const found = (account.members ?? []).find((m: MemberReference) => m.id === userId)
  return found?.role
}

// ---------------------------------------------------------------------------
// Team queries
// ---------------------------------------------------------------------------

/**
 * Returns all teams inside the organization that the given user belongs to.
 */
export function getUserTeams(account: Account, userId: string): Team[] {
  return (account.teams ?? []).filter((team: Team) =>
    (team.memberIds ?? []).includes(userId)
  )
}

/**
 * Returns a Set of team IDs that the given user belongs to within the account.
 * Used for efficient membership checks.
 */
export function getUserTeamIds(account: Account, userId: string): Set<string> {
  return new Set(getUserTeams(account, userId).map((t: Team) => t.id))
}
