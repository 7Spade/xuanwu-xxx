/**
 * centralized-tag — _bus.ts
 *
 * In-process tag lifecycle event bus.
 * Mirrors the organization event bus pattern.
 *
 * Per logic-overview_v5.md (VS0):
 *   CTA -->|"標籤異動廣播"| TAG_EVENTS --> IER
 *   TAG_EVENTS -.->|"契約遵循"| SK_ENV
 */

import type { ImplementsEventEnvelopeContract } from '@/shared-kernel/events/event-envelope';
import type { TagLifecycleEventPayloadMap, TagLifecycleEventKey } from './_events';

type TagEventHandler<K extends TagLifecycleEventKey> = (
  payload: TagLifecycleEventPayloadMap[K]
) => void | Promise<void>;

type TagEventHandlerMap = {
  [K in TagLifecycleEventKey]?: Array<TagEventHandler<K>>;
};

/** Marker: this module implements the shared-kernel.event-envelope contract (Invariant #8). */
export const implementsEventEnvelope: ImplementsEventEnvelopeContract['implementsEventEnvelope'] = true;

const handlers: TagEventHandlerMap = {};

/**
 * Subscribe to a tag lifecycle event.
 * Returns an unsubscribe function.
 */
export function onTagEvent<K extends TagLifecycleEventKey>(
  eventKey: K,
  handler: TagEventHandler<K>
): () => void {
  if (!handlers[eventKey]) {
    (handlers as Record<string, unknown[]>)[eventKey] = [];
  }
  (handlers[eventKey] as Array<TagEventHandler<K>>).push(handler);

  return () => {
    const list = handlers[eventKey] as Array<TagEventHandler<K>> | undefined;
    if (list) {
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    }
  };
}

/**
 * Publish a tag lifecycle event to all subscribers.
 */
export async function publishTagEvent<K extends TagLifecycleEventKey>(
  eventKey: K,
  payload: TagLifecycleEventPayloadMap[K]
): Promise<void> {
  const list = handlers[eventKey] as Array<TagEventHandler<K>> | undefined;
  if (!list?.length) return;
  await Promise.allSettled(list.map((h) => h(payload)));
}
