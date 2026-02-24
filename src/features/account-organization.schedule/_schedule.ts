/**
 * account-organization.schedule — _schedule.ts
 *
 * Handles the ScheduleProposed cross-layer event from the workspace layer
 * and publishes ScheduleAssigned to the organization event bus (FCM Layer 1).
 *
 * Per logic-overview.v3.md:
 *   WORKSPACE_OUTBOX →|ScheduleProposed（跨層事件）| ORGANIZATION_SCHEDULE
 *   ORGANIZATION_SCHEDULE → ORGANIZATION_EVENT_BUS → ACCOUNT_NOTIFICATION_ROUTER (FCM Layer 2+)
 *
 * Invariants respected:
 *   #1 — This BC only writes its own aggregate (orgScheduleProposals collection).
 *   #2 — Reads workspace schedule data only via the event payload (not domain model).
 *   #4 — Domain Events produced by ORGANIZATION_SCHEDULE; Transaction Runner collects them.
 */

import { setDocument, updateDocument } from '@/shared/infra/firestore/firestore.write.adapter';
import { publishOrgEvent } from '@/features/account-organization.event-bus';
import type { WorkspaceScheduleProposedPayload } from '@/features/workspace-core.event-bus';

export interface OrgScheduleProposal {
  scheduleItemId: string;
  workspaceId: string;
  orgId: string;
  title: string;
  startDate: string;
  endDate: string;
  proposedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  receivedAt: string;
}

/**
 * Handles a ScheduleProposed cross-layer event arriving from WORKSPACE_OUTBOX.
 *
 * Persists a pending org schedule proposal for governance review.
 * Does NOT immediately assign — assignment happens when org governance approves.
 */
export async function handleScheduleProposed(
  payload: WorkspaceScheduleProposedPayload
): Promise<void> {
  const proposal: OrgScheduleProposal = {
    scheduleItemId: payload.scheduleItemId,
    workspaceId: payload.workspaceId,
    orgId: payload.orgId,
    title: payload.title,
    startDate: payload.startDate,
    endDate: payload.endDate,
    proposedBy: payload.proposedBy,
    status: 'pending',
    receivedAt: new Date().toISOString(),
  };
  await setDocument(`orgScheduleProposals/${payload.scheduleItemId}`, proposal);
}

/**
 * Called by org-layer governance when a pending proposal is approved.
 *
 * Publishes `organization:schedule:assigned` to the org event bus (FCM Layer 1 trigger).
 * The event bus then routes to ACCOUNT_NOTIFICATION_ROUTER (Layer 2) and
 * ACCOUNT_PROJECTION_SCHEDULE (via EVENT_FUNNEL_INPUT).
 */
export async function approveOrgScheduleProposal(
  scheduleItemId: string,
  targetAccountId: string,
  assignedBy: string,
  opts: {
    workspaceId: string;
    orgId: string;
    title: string;
    startDate: string;
    endDate: string;
  }
): Promise<void> {
  // Use updateDocument to preserve all existing proposal fields
  await updateDocument(`orgScheduleProposals/${scheduleItemId}`, {
    status: 'approved',
  });

  await publishOrgEvent('organization:schedule:assigned', {
    scheduleItemId,
    workspaceId: opts.workspaceId,
    targetAccountId,
    assignedBy,
    startDate: opts.startDate,
    endDate: opts.endDate,
    title: opts.title,
  });
}
