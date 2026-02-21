/**
 * @fileoverview Barrel file for Firestore repositories.
 * Domain-specific repositories — each owns both reads and writes for its aggregate.
 */

export * from './account.repository' // createUserAccount, createOrganization, recruitOrganizationMember, dismissOrganizationMember, createTeam, updateTeamMembers, sendPartnerInvite, dismissPartnerMember, updateOrganizationSettings, deleteOrganization
export * from './user.repository' // getUserProfile, updateUserProfile, addBookmark, removeBookmark
export * from './workspace.repository' // createWorkspace, grantIndividualWorkspaceAccess, revokeIndividualWorkspaceAccess, mountCapabilities, unmountCapability, updateWorkspaceSettings, deleteWorkspace, createTask, updateTask, deleteTask, getWorkspaceTasks, getWorkspaceFiles, getWorkspaceGrants, createIssue, addCommentToIssue
export * from './schedule.repository' // createScheduleItem, updateScheduleItemStatus, assignMemberToScheduleItem, unassignMemberFromScheduleItem, getScheduleItems
export * from './daily.repository' // toggleDailyLogLike, addDailyLogComment, getDailyLogs
export * from './audit.repository' // getAuditLogs
