import {
  createOrganization as createOrganizationFacade,
  updateOrganizationSettings as updateOrganizationSettingsFacade,
  deleteOrganization as deleteOrganizationFacade,
  createTeam as createTeamFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { Account, ThemeConfig } from "@/shared/types"

export async function createOrganization(
  orgName: string,
  owner: Account
): Promise<string> {
  return createOrganizationFacade(orgName, owner)
}

export async function updateOrganizationSettings(
  orgId: string,
  settings: { name?: string; description?: string; theme?: ThemeConfig | null }
): Promise<void> {
  return updateOrganizationSettingsFacade(orgId, settings)
}

export async function deleteOrganization(orgId: string): Promise<void> {
  return deleteOrganizationFacade(orgId)
}

export async function setupOrganizationWithTeam(
  orgName: string,
  owner: Account,
  teamName: string,
  teamType: "internal" | "external" = "internal"
): Promise<string> {
  const orgId = await createOrganization(orgName, owner)
  await createTeamFacade(orgId, teamName, teamType)
  return orgId
}
