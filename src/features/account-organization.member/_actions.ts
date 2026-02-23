import {
  recruitOrganizationMember,
  dismissOrganizationMember,
} from "@/shared/infra/firestore/firestore.facade"
import type { MemberReference } from "@/shared/types"

export async function recruitMember(
  orgId: string,
  newId: string,
  name: string,
  email: string
): Promise<void> {
  return recruitOrganizationMember(orgId, newId, name, email)
}

export async function dismissMember(
  orgId: string,
  member: MemberReference
): Promise<void> {
  return dismissOrganizationMember(orgId, member)
}
