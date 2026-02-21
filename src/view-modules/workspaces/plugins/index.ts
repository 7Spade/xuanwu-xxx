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

export { WorkspaceAcceptance } from './acceptance/acceptance-plugin'; // Acceptance review tab for a single workspace
export { WorkspaceAudit } from './audit/audit.workspace-view'; // Audit log view scoped to a single workspace
export { WorkspaceCapabilities } from './plugin-settings/plugin-settings'; // Plugin/capability settings panel for a single workspace
export { WorkspaceDaily } from './daily/daily.workspace-view'; // Daily log view scoped to a single workspace
export { WorkspaceFiles } from './files/files-plugin'; // File management panel for a single workspace
export { WorkspaceFinance } from './finance/finance-plugin'; // Finance tab for a single workspace
export { WorkspaceIssues } from './issues/issues-plugin'; // Issues tracker for a single workspace
export { WorkspaceMembers } from './members/members-plugin'; // Members & access grants management for a single workspace
export { WorkspaceQA } from './qa/qa-plugin'; // QA tab for a single workspace
export { WorkspaceTasks } from './tasks/tasks-plugin'; // Task management (WBS tree) for a single workspace
export { WorkspaceSchedule } from './schedule/schedule.workspace-view'; // Schedule view scoped to a single workspace
export { WorkspaceDocumentParser } from './document-parser/document-parser-plugin'; // AI-powered document parser for a single workspace
export { AccountScheduleSection } from './schedule/schedule.account-view'; // Schedule view aggregated across all workspaces (account-level)
export { AccountAuditComponent } from './audit/audit.account-view'; // Audit log view aggregated across all workspaces (account-level)
export { AccountDailyComponent } from './daily/daily.account-view'; // Daily log view aggregated across all workspaces (account-level)
