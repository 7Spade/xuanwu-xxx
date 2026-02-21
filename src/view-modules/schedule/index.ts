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

export { AccountScheduleSection } from './schedule.account-view';    // Account-wide schedule view with staffing & governance sections
export { WorkspaceSchedule }       from './schedule.workspace-view';  // Per-workspace schedule view showing proposals for that workspace
export { ScheduleProposalContent } from './_components/schedule-proposal-content'; // Shared proposal detail/list content used by both views
export { GovernanceSidebar }       from './_components/governance-sidebar';        // Sidebar panel for approving/rejecting schedule proposals
