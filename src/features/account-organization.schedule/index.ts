// account-organization.schedule — HR scheduling management · ScheduleAssigned event (FCM Layer 1)
// AccountScheduleSection lives in workspace-business.schedule (tightly coupled to workspace-level
// sub-components); proper decoupling via projection read model is deferred to a future task.

export { handleScheduleProposed, approveOrgScheduleProposal } from './_schedule';
export type { OrgScheduleProposal } from './_schedule';

