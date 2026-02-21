/**
 * @fileoverview workspace.commands.ts - Pure business logic for workspace write operations.
 * @description Contains framework-agnostic action functions for managing workspaces,
 * including team authorization, member access grants, capabilities, settings, and
 * lifecycle. These functions can be called from React hooks, context, or future
 * Server Actions without any React dependencies.
 */

import {
  createWorkspace as createWorkspaceFacade,
  authorizeWorkspaceTeam as authorizeWorkspaceTeamFacade,
  revokeWorkspaceTeam as revokeWorkspaceTeamFacade,
  grantIndividualWorkspaceAccess as grantIndividualWorkspaceAccessFacade,
  revokeIndividualWorkspaceAccess as revokeIndividualWorkspaceAccessFacade,
  mountCapabilities as mountCapabilitiesFacade,
  unmountCapability as unmountCapabilityFacade,
  updateWorkspaceSettings as updateWorkspaceSettingsFacade,
  deleteWorkspace as deleteWorkspaceFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { Account, Capability, WorkspaceRole, WorkspaceLifecycleState } from "@/shared/types"

export async function createWorkspace(
  name: string,
  account: Account
): Promise<string> {
  return createWorkspaceFacade(name, account)
}

export async function authorizeWorkspaceTeam(
  workspaceId: string,
  teamId: string
): Promise<void> {
  return authorizeWorkspaceTeamFacade(workspaceId, teamId)
}

export async function revokeWorkspaceTeam(
  workspaceId: string,
  teamId: string
): Promise<void> {
  return revokeWorkspaceTeamFacade(workspaceId, teamId)
}

export async function grantIndividualWorkspaceAccess(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
  protocol?: string
): Promise<void> {
  return grantIndividualWorkspaceAccessFacade(workspaceId, userId, role, protocol)
}

export async function revokeIndividualWorkspaceAccess(
  workspaceId: string,
  grantId: string
): Promise<void> {
  return revokeIndividualWorkspaceAccessFacade(workspaceId, grantId)
}

export async function mountCapabilities(
  workspaceId: string,
  capabilities: Capability[]
): Promise<void> {
  return mountCapabilitiesFacade(workspaceId, capabilities)
}

export async function unmountCapability(
  workspaceId: string,
  capability: Capability
): Promise<void> {
  return unmountCapabilityFacade(workspaceId, capability)
}

export async function updateWorkspaceSettings(
  workspaceId: string,
  settings: {
    name: string
    visibility: "visible" | "hidden"
    lifecycleState: WorkspaceLifecycleState
  }
): Promise<void> {
  return updateWorkspaceSettingsFacade(workspaceId, settings)
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  return deleteWorkspaceFacade(workspaceId)
}
