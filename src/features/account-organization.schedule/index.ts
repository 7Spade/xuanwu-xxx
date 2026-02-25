// account-organization.schedule — HR scheduling management · ScheduleAssigned event (FCM Layer 1)
// Aggregate state machine: draft → proposed → confirmed | cancelled
// Skill validation reads projection.org-eligible-member-view (Invariant #14).
// Tier derived via resolveSkillTier(xp), never stored in DB (Invariant #12).
// ScheduleAssignRejected and ScheduleProposalCancelled are compensating events (Scheduling Saga, Invariant A5).

export { handleScheduleProposed, approveOrgScheduleProposal, cancelOrgScheduleProposal, orgScheduleProposalSchema, ORG_SCHEDULE_STATUSES } from './_schedule';
export type {
  OrgScheduleProposal,
  OrgScheduleStatus,
  ScheduleApprovalResult,
} from './_schedule';

export {
  getOrgScheduleProposal,
  subscribeToOrgScheduleProposals,
  subscribeToPendingProposals,
} from './_queries';

export { useOrgSchedule, usePendingScheduleProposals } from './_hooks/use-org-schedule';

export { OrgScheduleGovernance } from './_components/org-schedule-governance';

