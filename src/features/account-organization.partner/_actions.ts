import {
  createTeam as createTeamFacade,
  sendPartnerInvite as sendPartnerInviteFacade,
  dismissPartnerMember as dismissPartnerMemberFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { MemberReference } from "@/shared/types"

export async function createPartnerGroup(
  orgId: string,
  groupName: string
): Promise<void> {
  return createTeamFacade(orgId, groupName, "external")
}

export async function sendPartnerInvite(
  orgId: string,
  teamId: string,
  email: string
): Promise<void> {
  return sendPartnerInviteFacade(orgId, teamId, email)
}

export async function dismissPartnerMember(
  orgId: string,
  teamId: string,
  member: MemberReference
): Promise<void> {
  return dismissPartnerMemberFacade(orgId, teamId, member)
}
