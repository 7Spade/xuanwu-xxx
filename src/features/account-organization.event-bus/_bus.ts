/**
 * account-organization.event-bus — _bus.ts
 *
 * In-process organization event bus.
 * Mirrors the workspace event bus pattern.
 *
 * Per logic-overview.v3.md:
 *   ORGANIZATION_ENTITY → ORGANIZATION_EVENT_BUS
 *   ORGANIZATION_EVENT_BUS → all downstream listeners
 *   ORGANIZATION_EVENT_BUS -.→ shared-kernel.event-envelope（契約遵循）
 */

import type { ImplementsEventEnvelopeContract } from '@/shared-kernel/events/event-envelope';
import type { OrganizationEventPayloadMap, OrganizationEventKey } from './_events';

type OrgEventHandler<K extends OrganizationEventKey> = (
  payload: OrganizationEventPayloadMap[K]
) => void | Promise<void>;

type OrgEventHandlerMap = {
  [K in OrganizationEventKey]?: Array<OrgEventHandler<K>>;
};

/** Marker: this module implements the shared-kernel.event-envelope contract (Invariant #8). */
export const implementsEventEnvelope: ImplementsEventEnvelopeContract['implementsEventEnvelope'] = true;

const handlers: OrgEventHandlerMap = {};

/**
 * Subscribe to an organization event.
 * Returns an unsubscribe function.
 */
export function onOrgEvent<K extends OrganizationEventKey>(
  eventKey: K,
  handler: OrgEventHandler<K>
): () => void {
  if (!handlers[eventKey]) {
    (handlers as Record<string, unknown[]>)[eventKey] = [];
  }
  (handlers[eventKey] as Array<OrgEventHandler<K>>).push(handler);

  return () => {
    const list = handlers[eventKey] as Array<OrgEventHandler<K>> | undefined;
    if (list) {
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    }
  };
}

/**
 * Publish an organization event to all subscribers.
 */
export async function publishOrgEvent<K extends OrganizationEventKey>(
  eventKey: K,
  payload: OrganizationEventPayloadMap[K]
): Promise<void> {
  const list = handlers[eventKey] as Array<OrgEventHandler<K>> | undefined;
  if (!list?.length) return;
  await Promise.allSettled(list.map((h) => h(payload)));
}
