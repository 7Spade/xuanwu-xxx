/**
 * @fileoverview features/account — Multi-step account use cases.
 * No React. No UI. Callable from hooks, context, or Server Actions.
 */

import { createOrganization, createTeam } from "@/server-commands/account"
import type { Account } from "@/shared/types"

/**
 * Creates a new organization and immediately provisions an initial team.
 * Combines two action calls into one atomic use case.
 *
 * @param orgName   Name of the new organization
 * @param owner     The owning account
 * @param teamName  Name of the initial team to create
 * @param teamType  Team type: 'internal' or 'external'
 * @returns         The new organization ID
 */
export async function setupOrganizationWithTeam(
  orgName: string,
  owner: Account,
  teamName: string,
  teamType: "internal" | "external" = "internal"
): Promise<string> {
  const orgId = await createOrganization(orgName, owner)
  await createTeam(orgId, teamName, teamType)
  return orgId
}
