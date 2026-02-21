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

export { WorkspaceAcceptance }    from './acceptance/acceptance-plugin';           // Workspace acceptance/sign-off plugin tab
export { WorkspaceAudit }         from './audit/audit.workspace-view';              // Workspace-scoped audit log plugin tab
export { WorkspaceCapabilities }  from './plugin-settings/plugin-settings';         // Plugin/capability settings management tab
export { WorkspaceDaily }         from './daily/daily.workspace-view';              // Workspace daily log plugin tab
export { WorkspaceFiles }         from './files/files-plugin';                      // Workspace file management plugin tab
export { WorkspaceFinance }       from './finance/finance-plugin';                  // Workspace finance plugin tab
export { WorkspaceIssues }        from './issues/issues-plugin';                    // Workspace issues tracker plugin tab
export { WorkspaceMembers }       from './members/members-plugin';                  // Workspace members & access management plugin tab
export { WorkspaceQA }            from './qa/qa-plugin';                            // Workspace QA plugin tab
export { WorkspaceTasks }         from './tasks/tasks-plugin';                      // Workspace tasks plugin tab
export { WorkspaceDocumentParser } from './document-parser/document-parser-plugin'; // Workspace document-parser plugin tab
// Schedule is a top-level view-module (cross-cutting: account + workspace); forward from its barrel.
export { WorkspaceSchedule, AccountScheduleSection } from '@/view-modules/schedule'; // WorkspaceSchedule = per-workspace schedule tab; AccountScheduleSection = account-wide schedule page
export { AccountAuditComponent }  from './audit/audit.account-view';                // Account-wide audit log view (cross-workspace)
export { AccountDailyComponent }  from './daily/daily.account-view';                // Account-wide daily log view (cross-workspace)
