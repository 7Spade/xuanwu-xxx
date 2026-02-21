/**
 * @fileoverview account.commands.ts - Pure business logic for account (organization) write operations.
 * @description Contains framework-agnostic action functions for managing organization
 * accounts, teams, and members. These functions accept all required data as explicit
 * parameters (no React context dependencies), making them callable from hooks,
 * context, or future Server Actions.
 */

import {
  createOrganization as createOrganizationFacade,
  recruitOrganizationMember,
  dismissOrganizationMember,
  createTeam as createTeamFacade,
  updateTeamMembers as updateTeamMembersFacade,
  sendPartnerInvite as sendPartnerInviteFacade,
  dismissPartnerMember as dismissPartnerMemberFacade,
  updateOrganizationSettings as updateOrganizationSettingsFacade,
  deleteOrganization as deleteOrganizationFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { Account, MemberReference, ThemeConfig } from "@/shared/types"

export async function createOrganization(
  orgName: string,
  owner: Account
): Promise<string> {
  return createOrganizationFacade(orgName, owner)
}

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

export async function updateOrganizationSettings(
  orgId: string,
  settings: { name?: string; description?: string; theme?: ThemeConfig | null }
): Promise<void> {
  return updateOrganizationSettingsFacade(orgId, settings)
}

export async function deleteOrganization(orgId: string): Promise<void> {
  return deleteOrganizationFacade(orgId)
}
