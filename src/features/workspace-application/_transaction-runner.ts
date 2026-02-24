/**
 * workspace-application/_transaction-runner.ts
 *
 * Runs domain command handlers in a transaction context.
 * Provides an Outbox for collecting domain events during execution.
 * After handler completion, appends all events to the workspace event store.
 *
 * Per logic-overview.v3.md:
 * - WORKSPACE_POLICY_ENGINE → WORKSPACE_TRANSACTION_RUNNER
 * - WORKSPACE_TRANSACTION_RUNNER → WORKSPACE_AGGREGATE
 * - WORKSPACE_AGGREGATE → WORKSPACE_EVENT_STORE
 * - WORKSPACE_TRANSACTION_RUNNER →|彙整 Aggregate 未提交事件後寫入| WORKSPACE_OUTBOX
 * - Invariant #4: Transaction Runner only aggregates already-produced events.
 */

import { appendDomainEvent } from '@/features/workspace-core.event-store';
import { createOutbox, type Outbox, type OutboxEvent } from './_outbox';

export interface TransactionContext {
  workspaceId: string;
  correlationId: string;
  /** Collect domain events produced by the aggregate during this transaction. */
  outbox: Outbox;
}

export interface TransactionResult<T> {
  value: T;
  /** Events collected during the transaction (already appended to event store). */
  events: OutboxEvent[];
}

/**
 * Executes a domain command handler inside a transaction context.
 *
 * 1. Creates a fresh Outbox for event collection.
 * 2. Runs the handler (which executes aggregate logic and collects events).
 * 3. Drains and appends all collected events to the workspace event store.
 * 4. Returns the handler result + collected events (for Outbox flush to event bus).
 */
export async function runTransaction<T>(
  workspaceId: string,
  userId: string,
  handler: (ctx: TransactionContext) => Promise<T>
): Promise<TransactionResult<T>> {
  const correlationId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const outbox = createOutbox();

  const ctx: TransactionContext = { workspaceId, correlationId, outbox };
  const value = await handler(ctx);

  // Drain events from the outbox and append to the event store (best-effort)
  const events = outbox.drain();
  for (const event of events) {
    await appendDomainEvent(workspaceId, {
      eventType: event.type,
      payload: event.payload as unknown as Record<string, unknown>,
      aggregateId: workspaceId,
      correlationId,
      causedBy: userId,
    }).catch((err: unknown) => {
      // Event store append is best-effort — do not fail the command
      console.error('[workspace-application] Failed to append event to store:', err);
    });
  }

  return { value, events };
}
