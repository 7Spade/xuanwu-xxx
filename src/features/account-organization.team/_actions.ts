import {
  createTeam as createTeamFacade,
  updateTeamMembers as updateTeamMembersFacade,
} from "@/shared/infra/firestore/firestore.facade"

export async function createTeam(
  organizationId: string,
  teamName: string,
  type: "internal" | "external"
): Promise<void> {
  return createTeamFacade(organizationId, teamName, type)
}

export async function updateTeamMembers(
  organizationId: string,
  teamId: string,
  memberId: string,
  action: "add" | "remove"
): Promise<void> {
  return updateTeamMembersFacade(organizationId, teamId, memberId, action)
}
