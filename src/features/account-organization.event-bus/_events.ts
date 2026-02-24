/**
 * account-organization.event-bus — _events.ts
 *
 * Organization domain event contracts.
 *
 * Per logic-overview.v3.md:
 *   ORGANIZATION_EVENT_BUS → ORGANIZATION_SCHEDULE (ScheduleAssigned)
 *   ORGANIZATION_EVENT_BUS → |政策變更| WORKSPACE_ORG_POLICY_CACHE
 *   ORGANIZATION_EVENT_BUS → |ScheduleAssigned 含 TargetAccountID| ACCOUNT_NOTIFICATION_ROUTER
 *   ORGANIZATION_EVENT_BUS -.→ shared-kernel.event-envelope (契約遵循)
 */

// =================================================================
// == Payload Interfaces
// =================================================================

export interface ScheduleAssignedPayload {
  scheduleItemId: string;
  workspaceId: string;
  targetAccountId: string;
  assignedBy: string;
  startDate: string;
  endDate: string;
  title: string;
}

export interface OrgPolicyChangedPayload {
  orgId: string;
  policyId: string;
  changeType: 'created' | 'updated' | 'deleted';
  changedBy: string;
}

export interface OrgMemberJoinedPayload {
  orgId: string;
  accountId: string;
  role: string;
  joinedBy: string;
}

export interface OrgMemberLeftPayload {
  orgId: string;
  accountId: string;
  removedBy: string;
}

export interface OrgTeamUpdatedPayload {
  orgId: string;
  teamId: string;
  teamName: string;
  memberIds: string[];
  updatedBy: string;
}

// =================================================================
// == Event Key Map
// =================================================================

export interface OrganizationEventPayloadMap {
  'organization:schedule:assigned': ScheduleAssignedPayload;
  'organization:policy:changed': OrgPolicyChangedPayload;
  'organization:member:joined': OrgMemberJoinedPayload;
  'organization:member:left': OrgMemberLeftPayload;
  'organization:team:updated': OrgTeamUpdatedPayload;
}

export type OrganizationEventKey = keyof OrganizationEventPayloadMap;
