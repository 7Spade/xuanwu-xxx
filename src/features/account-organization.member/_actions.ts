import {
  recruitOrganizationMember,
  dismissOrganizationMember,
} from "@/shared/infra/firestore/firestore.facade"
import type { MemberReference } from "@/shared/types"

export async function recruitMember(
  organizationId: string,
  newId: string,
  name: string,
  email: string
): Promise<void> {
  return recruitOrganizationMember(organizationId, newId, name, email)
}

export async function dismissMember(
  organizationId: string,
  member: MemberReference
): Promise<void> {
  return dismissOrganizationMember(organizationId, member)
}
