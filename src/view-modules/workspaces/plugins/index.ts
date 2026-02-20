/**
 * @fileoverview Barrel file for workspace capabilities.
 * This file provides a single entry point for all capability components,
 * ensuring a clean and consistent import path across the application.
 * All capabilities MUST be exported from this file.
 *
 * Naming convention for dual-view capabilities:
 *   {pluginTab}.workspace.tsx  — workspace-scoped view (single workspace)
 *   {pluginTab}.account.tsx    — account-scoped view (all workspaces in account)
 */

export { WorkspaceAcceptance } from './acceptance/acceptance-plugin';
export { WorkspaceAudit } from './audit/audit.workspace-view';
export { WorkspaceCapabilities } from './plugin-settings/plugin-settings';
export { WorkspaceDaily } from './daily/daily.workspace-view';
export { WorkspaceFiles } from './files/files-plugin';
export { WorkspaceFinance } from './finance/finance-plugin';
export { WorkspaceIssues } from './issues/issues-plugin';
export { WorkspaceMembers } from './members/members-plugin';
export { WorkspaceQA } from './qa/qa-plugin';
export { WorkspaceTasks } from './tasks/tasks-plugin';
export { WorkspaceSchedule } from './schedule/schedule.workspace-view';
export { WorkspaceDocumentParser } from './document-parser/document-parser-plugin';
export { AccountAuditComponent } from './audit/audit.account-view';
export { AccountDailyComponent } from './daily/daily.account-view';
