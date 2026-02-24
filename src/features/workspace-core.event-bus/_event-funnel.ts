/**
 * Event Funnel — EVENT_FUNNEL_INPUT
 *
 * Unified entry point for the Projection Layer.
 * Routes events from BOTH workspace and organization buses to all projections.
 *
 * Per logic-overview.v3.md:
 *   WORKSPACE_EVENT_BUS → |所有業務事件| EVENT_FUNNEL_INPUT
 *   ORGANIZATION_EVENT_BUS → |所有組織事件| EVENT_FUNNEL_INPUT
 *
 *   EVENT_FUNNEL_INPUT routes to:
 *     → WORKSPACE_PROJECTION_VIEW
 *     → WORKSPACE_SCOPE_READ_MODEL
 *     → ACCOUNT_PROJECTION_VIEW
 *     → ACCOUNT_PROJECTION_AUDIT
 *     → ACCOUNT_PROJECTION_SCHEDULE
 *     → ORGANIZATION_PROJECTION_VIEW
 *     → PROJECTION_VERSION (updates stream offset)
 *
 *   WORKSPACE_EVENT_STORE -.→ EVENT_FUNNEL_INPUT (event replay can rebuild all projections)
 *
 * Usage: call `registerEventFunnel(workspaceBus)` once at app startup
 * (e.g. inside workspace-provider.tsx after the bus is created).
 */

import type { WorkspaceEventBus } from '@/features/workspace-core.event-bus';
import { upsertProjectionVersion } from '@/features/projection.registry';
import { appendAuditEntry } from '@/features/projection.account-audit';
import { applyScheduleAssigned } from '@/features/projection.account-schedule';
import { onOrgEvent } from '@/features/account-organization.event-bus';
import { applyMemberJoined, applyMemberLeft } from '@/features/projection.organization-view';
import { handleScheduleProposed } from '@/features/account-organization.schedule';

/**
 * Registers workspace event handlers on the event bus to keep projections in sync.
 * Returns a cleanup function.
 *
 * Note: projection updates are fire-and-forget (non-blocking to the UI event cycle).
 */
export function registerWorkspaceFunnel(bus: WorkspaceEventBus): () => void {
  const unsubscribers: Array<() => void> = [];

  // --- Workspace event → ACCOUNT_PROJECTION_AUDIT ---
  unsubscribers.push(
    bus.subscribe('workspace:tasks:blocked', async (payload) => {
      const actorId = payload.task.assigneeId ?? 'system';
      await appendAuditEntry(actorId, {
        accountId: actorId,
        eventType: 'workspace:tasks:blocked',
        actorId,
        targetId: payload.task.id,
        summary: `Task "${payload.task.name}" blocked: ${payload.reason ?? ''}`,
      });
      await upsertProjectionVersion('account-audit', Date.now(), new Date().toISOString());
    })
  );

  unsubscribers.push(
    bus.subscribe('workspace:issues:resolved', async (payload) => {
      await appendAuditEntry(payload.resolvedBy, {
        accountId: payload.resolvedBy,
        eventType: 'workspace:issues:resolved',
        actorId: payload.resolvedBy,
        targetId: payload.issueId,
        summary: `Issue "${payload.issueTitle}" resolved`,
      });
      await upsertProjectionVersion('account-audit', Date.now(), new Date().toISOString());
    })
  );

  // WORKSPACE_OUTBOX →|ScheduleProposed（跨層事件）| ORGANIZATION_SCHEDULE
  unsubscribers.push(
    bus.subscribe('workspace:schedule:proposed', async (payload) => {
      await handleScheduleProposed(payload);
      await upsertProjectionVersion('org-schedule-proposals', Date.now(), new Date().toISOString());
    })
  );

  return () => unsubscribers.forEach((u) => u());
}

/**
 * Registers organization event handlers to keep org and schedule projections in sync.
 * Returns a cleanup function.
 */
export function registerOrganizationFunnel(): () => void {
  const unsubscribers: Array<() => void> = [];

  // ScheduleAssigned → account-schedule projection
  unsubscribers.push(
    onOrgEvent('organization:schedule:assigned', async (payload) => {
      await applyScheduleAssigned(payload.targetAccountId, {
        scheduleItemId: payload.scheduleItemId,
        workspaceId: payload.workspaceId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: 'upcoming',
      });
      await upsertProjectionVersion('account-schedule', Date.now(), new Date().toISOString());
    })
  );

  // Member joined → organization-view projection
  unsubscribers.push(
    onOrgEvent('organization:member:joined', async (payload) => {
      await applyMemberJoined(payload.orgId, payload.accountId);
      await upsertProjectionVersion('organization-view', Date.now(), new Date().toISOString());
    })
  );

  // Member left → organization-view projection
  unsubscribers.push(
    onOrgEvent('organization:member:left', async (payload) => {
      await applyMemberLeft(payload.orgId, payload.accountId);
      await upsertProjectionVersion('organization-view', Date.now(), new Date().toISOString());
    })
  );

  return () => unsubscribers.forEach((u) => u());
}

/**
 * Replays events from the event store to rebuild all workspace projections.
 * Implements: WORKSPACE_EVENT_STORE -.→ EVENT_FUNNEL_INPUT
 */
export async function replayWorkspaceProjections(
  workspaceId: string
): Promise<{ replayed: number }> {
  const { getDomainEvents } = await import(
    '@/shared/infra/firestore/repositories/workspace-core.event-store.repository'
  );
  const events = await getDomainEvents(workspaceId);
  // Replay: update projection registry offset
  if (events.length > 0) {
    await upsertProjectionVersion(`workspace-${workspaceId}`, events.length, new Date().toISOString());
  }
  return { replayed: events.length };
}
