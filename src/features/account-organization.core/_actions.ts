import {
  createOrganization as createOrganizationFacade,
  updateOrganizationSettings as updateOrganizationSettingsFacade,
  deleteOrganization as deleteOrganizationFacade,
  createTeam as createTeamFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { Account, ThemeConfig } from "@/shared/types"

export async function createOrganization(
  organizationName: string,
  owner: Account
): Promise<string> {
  return createOrganizationFacade(organizationName, owner)
}

export async function updateOrganizationSettings(
  organizationId: string,
  settings: { name?: string; description?: string; theme?: ThemeConfig | null }
): Promise<void> {
  return updateOrganizationSettingsFacade(organizationId, settings)
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  return deleteOrganizationFacade(organizationId)
}

export async function setupOrganizationWithTeam(
  organizationName: string,
  owner: Account,
  teamName: string,
  teamType: "internal" | "external" = "internal"
): Promise<string> {
  const organizationId = await createOrganization(organizationName, owner)
  await createTeamFacade(organizationId, teamName, teamType)
  return organizationId
}
