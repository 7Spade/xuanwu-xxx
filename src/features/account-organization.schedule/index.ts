// account-organization.schedule — HR scheduling management · ScheduleAssigned event (FCM Layer 1)
// Aggregate state machine: draft → proposed → confirmed | cancelled
// Skill validation reads projection.org-eligible-member-view (Invariant #14).
// Tier derived via resolveSkillTier(xp), never stored in DB (Invariant #12).
// ScheduleAssignRejected is the compensating event for failed assignments (Invariant A5).

export { handleScheduleProposed, approveOrgScheduleProposal, orgScheduleProposalSchema, ORG_SCHEDULE_STATUSES } from './_schedule';
export type {
  OrgScheduleProposal,
  OrgScheduleStatus,
  ScheduleApprovalResult,
} from './_schedule';

