/**
 * projection.account-schedule — Public API
 *
 * Account schedule projection — used by workspace-business.schedule
 * to filter available accounts for assignment.
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_SCHEDULE
 *   W_B_SCHEDULE -.→ ACCOUNT_PROJECTION_SCHEDULE (過濾可用帳號)
 */

export { getAccountScheduleProjection, getAccountActiveAssignments } from './_queries';
export {
  initAccountScheduleProjection,
  applyScheduleAssigned,
  applyScheduleCompleted,
} from './_projector';
export type { AccountScheduleProjection, AccountScheduleAssignment } from './_projector';
