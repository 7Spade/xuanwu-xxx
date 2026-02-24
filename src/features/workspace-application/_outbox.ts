/**
 * workspace-application/_outbox.ts
 *
 * In-process transaction outbox: collects domain events during a transaction,
 * then flushes them to the workspace event bus after commit.
 *
 * Per logic-overview.v3.md invariant #4:
 * Transaction Runner collects uncommitted aggregate events and writes Outbox.
 * Domain Events are produced only by Aggregates; Transaction Runner only
 * collects already-produced events and delivers them to the Outbox.
 *
 * Flow: WORKSPACE_TRANSACTION_RUNNER →|彙整事件後寫入| WORKSPACE_OUTBOX → WORKSPACE_EVENT_BUS
 */

import type {
  WorkspaceEventName,
  WorkspaceEventPayloadMap,
} from '@/features/workspace-core.event-bus';

export type OutboxEvent = {
  [K in WorkspaceEventName]: { type: K; payload: WorkspaceEventPayloadMap[K] };
}[WorkspaceEventName];

export interface Outbox {
  /** Collect a domain event produced by the aggregate. */
  collect<T extends WorkspaceEventName>(type: T, payload: WorkspaceEventPayloadMap[T]): void;
  /** Flush all collected events to the event bus. Does not modify internal state. */
  flush(publish: (type: string, payload: unknown) => void): void;
  /** Drain and return all collected events (empties the buffer). */
  drain(): OutboxEvent[];
}

/** Creates a new in-process Outbox for use within a single transaction. */
export function createOutbox(): Outbox {
  const events: OutboxEvent[] = [];

  return {
    collect<T extends WorkspaceEventName>(type: T, payload: WorkspaceEventPayloadMap[T]) {
      events.push({ type, payload } as OutboxEvent);
    },
    flush(publish: (type: string, payload: unknown) => void) {
      // Flush without draining — caller decides when to drain
      for (const event of events) {
        publish(event.type, event.payload);
      }
    },
    drain() {
      return events.splice(0);
    },
  };
}
