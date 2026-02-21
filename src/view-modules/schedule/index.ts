/**
 * @fileoverview Schedule feature — unified entry point.
 *
 * One core domain, two consumer views:
 *   - AccountScheduleSection  → account/schedule page (org-wide staffing & governance)
 *   - WorkspaceSchedule       → workspace @plugin-tab/schedule (per-workspace proposals)
 *
 * Shared primitives live in ./_components/ and are private to this module.
 * Consumers import only from this barrel.
 */

export { AccountScheduleSection } from './schedule.account-view';
export { WorkspaceSchedule } from './schedule.workspace-view';
export { ScheduleProposalContent } from './_components/schedule-proposal-content';
export { GovernanceSidebar } from './_components/governance-sidebar';
