/**
 * @fileoverview Barrel file for workspace capabilities.
 * This file provides a single entry point for all capability components,
 * ensuring a clean and consistent import path across the application.
 * All capabilities MUST be exported from this file.
 *
 * Naming convention for dual-view capabilities:
 *   {capability}.workspace.tsx  — workspace-scoped view (single workspace)
 *   {capability}.account.tsx    — account-scoped view (all workspaces in account)
 */

export { WorkspaceAcceptance } from './acceptance/workspace-acceptance';
export { WorkspaceAudit } from './audit/audit.workspace';
export { WorkspaceCapabilities } from './capabilities/workspace-capabilities';
export { WorkspaceDaily } from './daily/daily.workspace';
export { WorkspaceFiles } from './files/workspace-files';
export { WorkspaceFinance } from './finance/workspace-finance';
export { WorkspaceIssues } from './issues/workspace-issues';
export { WorkspaceMembers } from './members/workspace-members';
export { WorkspaceQA } from './qa/workspace-qa';
export { WorkspaceTasks } from './tasks/workspace-tasks.component';
export { WorkspaceSchedule } from './schedule/schedule.workspace';
export { WorkspaceDocumentParser } from './document-parser/workspace-document-parser.component';
