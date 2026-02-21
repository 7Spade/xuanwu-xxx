/**
 * @fileoverview src/entities/index.ts — Re-exports all entity modules.
 *
 * Import from this barrel file or from the specific sub-module:
 *   import { filterVisibleWorkspaces } from '@/domain-rules/workspace'
 *   import { isOrganization } from '@/domain-rules/account'
 */

export * from "./account"   // isOrganization, isPersonalAccount, isOwner, getMemberRole, getUserTeams, getUserTeamIds
export * from "./workspace" // hasWorkspaceAccess, isWorkspaceVisibleToUser, filterVisibleWorkspaces
export * from "./schedule"  // VALID_STATUS_TRANSITIONS, canTransitionScheduleStatus
export * from "./task"      // buildTaskTree
export * from "./user"      // isAnonymousUser
