import {
  createTeam as createTeamFacade,
  sendPartnerInvite as sendPartnerInviteFacade,
  dismissPartnerMember as dismissPartnerMemberFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { MemberReference } from "@/shared/types"

export async function createPartnerGroup(
  organizationId: string,
  groupName: string
): Promise<void> {
  return createTeamFacade(organizationId, groupName, "external")
}

export async function sendPartnerInvite(
  organizationId: string,
  teamId: string,
  email: string
): Promise<void> {
  return sendPartnerInviteFacade(organizationId, teamId, email)
}

export async function dismissPartnerMember(
  organizationId: string,
  teamId: string,
  member: MemberReference
): Promise<void> {
  return dismissPartnerMemberFacade(organizationId, teamId, member)
}
