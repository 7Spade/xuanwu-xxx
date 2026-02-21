/**
 * @fileoverview src/server-commands/index.ts — Re-exports all server-command modules.
 *
 * Import from the domain sub-directory for clarity:
 *   import { createWorkspace } from '@/server-commands/workspace'
 *   import { signIn } from '@/server-commands/auth'
 *
 * Or import everything from here:
 *   import { createWorkspace, signIn } from '@/server-commands'
 */

export * from "./account"         // createOrganization, recruitMember, dismissMember, createTeam, updateTeamMembers, sendPartnerInvite, dismissPartnerMember, updateOrganizationSettings, deleteOrganization
export * from "./audit"           // getAuditLogs
export * from "./auth"            // signIn, registerUser, signInAnonymously, sendPasswordResetEmail, signOut
export * from "./workspace"       // createWorkspace, authorizeWorkspaceTeam, revokeWorkspaceTeam, grantIndividualWorkspaceAccess, revokeIndividualWorkspaceAccess, mountCapabilities, unmountCapability, updateWorkspaceSettings, deleteWorkspace
export * from "./bookmark"        // toggleBookmark
export * from "./daily"           // toggleLike, addDailyLogComment, getDailyLogs
export * from "./document-parser" // ActionState, extractDataFromDocument
export * from "./files"           // getWorkspaceFiles
export * from "./issue"           // createIssue, addCommentToIssue
export * from "./members"         // getWorkspaceGrants
export * from "./schedule"        // assignMember, unassignMember, createScheduleItem, updateScheduleItemStatus, getScheduleItems
export * from "./storage"         // uploadDailyPhoto, uploadTaskAttachment, uploadProfilePicture
export * from "./task"            // createTask, updateTask, deleteTask, batchImportTasks, getWorkspaceTasks
export * from "./user"            // createUserAccount, getUserProfile, updateUserProfile
