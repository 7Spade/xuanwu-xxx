/**
 * @fileoverview Firestore Facade.
 *
 * This file acts as a simplified, high-level interface to the Firestore repositories.
 * Its purpose is to provide a single, unified entry point for all data operations,
 * abstracting away the underlying repository structure from the rest of the application.
 * This facade is now a "thin" layer, primarily responsible for re-exporting
 * functions from the more specialized repository modules.
 */

import * as repositories from './repositories'

// ==================================================================
// == Account Aggregate Exports (Organizations + User Profiles)
// ==================================================================

export const createUserAccount = repositories.createUserAccount
export const createOrganization = repositories.createOrganization
export const recruitOrganizationMember = repositories.recruitOrganizationMember
export const dismissOrganizationMember = repositories.dismissOrganizationMember
export const createTeam = repositories.createTeam
export const updateTeamMembers = repositories.updateTeamMembers
export const sendPartnerInvite = repositories.sendPartnerInvite
export const dismissPartnerMember = repositories.dismissPartnerMember
export const updateOrganizationSettings = repositories.updateOrganizationSettings
export const deleteOrganization = repositories.deleteOrganization
export const getUserProfile = repositories.getUserProfile
export const updateUserProfile = repositories.updateUserProfile
export const addBookmark = repositories.addBookmark
export const removeBookmark = repositories.removeBookmark

// ==================================================================
// == Workspace Aggregate Exports
// ==================================================================

export const createWorkspace = repositories.createWorkspace
export const authorizeWorkspaceTeam = repositories.authorizeWorkspaceTeam
export const revokeWorkspaceTeam = repositories.revokeWorkspaceTeam
export const grantIndividualWorkspaceAccess =
  repositories.grantIndividualWorkspaceAccess
export const revokeIndividualWorkspaceAccess =
  repositories.revokeIndividualWorkspaceAccess
export const mountCapabilities = repositories.mountCapabilities
export const unmountCapability = repositories.unmountCapability
export const updateWorkspaceSettings = repositories.updateWorkspaceSettings
export const deleteWorkspace = repositories.deleteWorkspace

// ==================================================================
// == Workspace Sub-Collection Exports
// ==================================================================

// Issues
export const createIssue = repositories.createIssue
export const addCommentToIssue = repositories.addCommentToIssue
export const resolveIssue = repositories.resolveIssue

// Tasks
export const createTask = repositories.createTask
export const updateTask = repositories.updateTask
export const deleteTask = repositories.deleteTask
export const getWorkspaceTask = repositories.getWorkspaceTask

// Schedule
export const createScheduleItem = repositories.createScheduleItem
export const assignMemberToScheduleItem = repositories.assignMemberToScheduleItem
export const unassignMemberFromScheduleItem = repositories.unassignMemberFromScheduleItem
export const updateScheduleItemStatus = repositories.updateScheduleItemStatus
export const toggleDailyLogLike = repositories.toggleDailyLogLike
export const addDailyLogComment = repositories.addDailyLogComment

// ==================================================================
// == Read-Only Aggregate Exports
// ==================================================================

// Account reads
export const getAuditLogs = repositories.getAuditLogs
export const getDailyLogs = repositories.getDailyLogs
export const getScheduleItems = repositories.getScheduleItems

// Workspace reads
export const getWorkspaceTasks = repositories.getWorkspaceTasks
export const getWorkspaceIssues = repositories.getWorkspaceIssues
export const getWorkspaceFiles = repositories.getWorkspaceFiles
export const getWorkspaceGrants = repositories.getWorkspaceGrants

// workspace-business.files — subcollection CRUD
export const createWorkspaceFile = repositories.createWorkspaceFile
export const addWorkspaceFileVersion = repositories.addWorkspaceFileVersion
export const restoreWorkspaceFileVersion = repositories.restoreWorkspaceFileVersion
export const getWorkspaceFilesFromSubcollection = repositories.getWorkspaceFilesFromSubcollection

// ParsingIntent (document-parser Digital Twin)
export const createParsingIntent = repositories.createParsingIntent
export const updateParsingIntentStatus = repositories.updateParsingIntentStatus
export const getParsingIntents = repositories.getParsingIntents

// ==================================================================
// == workspace-core.event-store — Append-only domain event log
// ==================================================================
export const appendDomainEvent = repositories.appendDomainEvent
export const getDomainEvents = repositories.getDomainEvents
export type { StoredWorkspaceEvent } from './repositories'

// ==================================================================
// == projection.registry — Event stream offset + read model versions
// ==================================================================
export const getProjectionVersion = repositories.getProjectionVersion
export const upsertProjectionVersion = repositories.upsertProjectionVersion
export type { ProjectionVersionRecord } from './repositories'
