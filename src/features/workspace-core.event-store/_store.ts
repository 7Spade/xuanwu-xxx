/**
 * workspace-core.event-store — Append-only domain event store.
 *
 * Per logic-overview.v3.md:
 * - WORKSPACE_AGGREGATE → WORKSPACE_EVENT_STORE
 * - WORKSPACE_EVENT_STORE -.→ EVENT_FUNNEL_INPUT (replay only, dotted edge)
 * - Invariant #9: Projections MUST be fully rebuildable from events stored here.
 */

import {
  appendDomainEvent as appendDomainEventRepo,
  getDomainEvents as getDomainEventsRepo,
  type StoredWorkspaceEvent,
} from '@/shared/infra/firestore/firestore.facade';

export type { StoredWorkspaceEvent };

/**
 * Appends a domain event to the workspace event store.
 * Called by the Transaction Runner after aggregate execution.
 */
export async function appendDomainEvent(
  workspaceId: string,
  event: Omit<StoredWorkspaceEvent, 'id' | 'occurredAt'>
): Promise<string> {
  return appendDomainEventRepo(workspaceId, event);
}

/**
 * Retrieves all domain events for replay or audit purposes.
 * Events are ordered by occurredAt (ascending).
 */
export async function getDomainEvents(
  workspaceId: string
): Promise<StoredWorkspaceEvent[]> {
  return getDomainEventsRepo(workspaceId);
}
