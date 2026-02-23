import {
  createTeam as createTeamFacade,
  updateTeamMembers as updateTeamMembersFacade,
} from "@/shared/infra/firestore/firestore.facade"

export async function createTeam(
  orgId: string,
  teamName: string,
  type: "internal" | "external"
): Promise<void> {
  return createTeamFacade(orgId, teamName, type)
}

export async function updateTeamMembers(
  orgId: string,
  teamId: string,
  memberId: string,
  action: "add" | "remove"
): Promise<void> {
  return updateTeamMembersFacade(orgId, teamId, memberId, action)
}
