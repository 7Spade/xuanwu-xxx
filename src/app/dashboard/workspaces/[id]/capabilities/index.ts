/**
 * @fileoverview Barrel file for workspace capabilities.
 * This file provides a single entry point for all capability components,
 * ensuring a clean and consistent import path across the application.
 * All capabilities MUST be exported from this file.
 */

export { WorkspaceAcceptance } from './acceptance/workspace-acceptance';
export { WorkspaceAudit } from './audit/workspace-audit';
export { WorkspaceCapabilities } from './capabilities/workspace-capabilities';
export { WorkspaceDaily } from './daily/workspace-daily';
export { WorkspaceFiles } from './files/workspace-files';
export { WorkspaceFinance } from './finance/workspace-finance';
export { WorkspaceIssues } from './issues/workspace-issues';
export { WorkspaceMembers } from './members/workspace-members';
export { WorkspaceQA } from './qa/workspace-qa';
export { WorkspaceTasks } from './tasks/workspace-tasks.component';
export { WorkspaceSchedule } from './schedule/workspace-schedule.component';
export { WorkspaceDocumentParser } from './document-parser/workspace-document-parser.component';
