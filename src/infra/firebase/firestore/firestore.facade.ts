/**
 * @fileoverview Firestore Facade.
 *
 * This file acts as a simplified, high-level interface to the Firestore repositories.
 * Its purpose is to provide a single, unified entry point for all data operations,
 * abstracting away the underlying repository structure from the rest of the application.
 * This facade is now a "thin" layer, primarily responsible for re-exporting
 * functions from the more specialized repository modules.
 */

import * as repositories from './repositories';

// ==================================================================
// == Organization Aggregate Exports
// ==================================================================

export const createOrganization = repositories.createOrganization;
export const recruitOrganizationMember = repositories.recruitOrganizationMember;
export const dismissOrganizationMember = repositories.dismissOrganizationMember;
export const createTeam = repositories.createTeam;
export const updateTeamMembers = repositories.updateTeamMembers;
export const sendPartnerInvite = repositories.sendPartnerInvite;
export const dismissPartnerMember = repositories.dismissPartnerMember;
export const updateOrganizationSettings = repositories.updateOrganizationSettings;
export const deleteOrganization = repositories.deleteOrganization;


// ==================================================================
// == Workspace Aggregate Exports
// ==================================================================

export const createWorkspace = repositories.createWorkspace;
export const authorizeWorkspaceTeam = repositories.authorizeWorkspaceTeam;
export const revokeWorkspaceTeam = repositories.revokeWorkspaceTeam;
export const grantIndividualWorkspaceAccess =
  repositories.grantIndividualWorkspaceAccess;
export const revokeIndividualWorkspaceAccess =
  repositories.revokeIndividualWorkspaceAccess;
export const mountCapabilities = repositories.mountCapabilities;
export const unmountCapability = repositories.unmountCapability;
export const updateWorkspaceSettings = repositories.updateWorkspaceSettings;
export const deleteWorkspace = repositories.deleteWorkspace;

// ==================================================================
// == User Aggregate Exports
// ==================================================================
export const getUserProfile = repositories.getUserProfile;
export const updateUserProfile = repositories.updateUserProfile;

// ==================================================================
// == Workspace Sub-Collection Exports
// ==================================================================

// Issues
export const createIssue = repositories.createIssue;
export const addCommentToIssue = repositories.addCommentToIssue;

// Tasks
export const createTask = repositories.createTask;
export const updateTask = repositories.updateTask;
export const deleteTask = repositories.deleteTask;

// Schedule
export const createScheduleItem = repositories.createScheduleItem;
export const assignMemberToScheduleItem = repositories.assignMemberToScheduleItem;
export const unassignMemberFromScheduleItem = repositories.unassignMemberFromScheduleItem;
export const updateScheduleItemStatus = repositories.updateScheduleItemStatus;
