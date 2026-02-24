/**
 * account-organization.event-bus — Public API
 *
 * Organization event bus — mirrors workspace-core.event-bus pattern.
 *
 * Per logic-overview.v3.md:
 *   ORGANIZATION_ENTITY → ORGANIZATION_EVENT_BUS
 *   ORGANIZATION_EVENT_BUS → [ORGANIZATION_SCHEDULE, WORKSPACE_ORG_POLICY_CACHE, ACCOUNT_NOTIFICATION_ROUTER]
 *   ORGANIZATION_EVENT_BUS -.→ shared-kernel.event-envelope
 */

export { onOrgEvent, publishOrgEvent } from './_bus';
export type {
  ScheduleAssignedPayload,
  ScheduleAssignRejectedPayload,
  OrgPolicyChangedPayload,
  OrgMemberJoinedPayload,
  OrgMemberLeftPayload,
  OrgTeamUpdatedPayload,
  SkillXpAddedPayload,
  SkillXpDeductedPayload,
  SkillRecognitionGrantedPayload,
  SkillRecognitionRevokedPayload,
  OrganizationEventPayloadMap,
  OrganizationEventKey,
} from './_events';
