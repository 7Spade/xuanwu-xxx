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
 * - WORKSPACE_TRANSACTION_RUNNER --> TRACE_IDENTIFIER (Observability)
 * - WORKSPACE_TRANSACTION_RUNNER --> DOMAIN_ERROR_LOG (Observability)
 * - Invariant #4: Transaction Runner only aggregates already-produced events.
 */

import { appendDomainEvent } from '@/features/workspace-core.event-store';
import { createOutbox, type Outbox, type OutboxEvent } from './_outbox';
import { generateTraceId, logDomainError } from '@/shared/observability';

export interface TransactionContext {
  workspaceId: string;
  /** Trace / correlation ID — shared with the Observability Layer (TRACE_IDENTIFIER node). */
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
 * 1. Creates a TraceContext via the Observability Layer (TRACE_IDENTIFIER node).
 * 2. Creates a fresh Outbox for event collection.
 * 3. Runs the handler (which executes aggregate logic and collects events).
 * 4. Drains and appends all collected events to the workspace event store.
 * 5. Returns the handler result + collected events (for Outbox flush to event bus).
 *
 * Errors are recorded via the Observability Layer (DOMAIN_ERROR_LOG node) before
 * being re-thrown so callers are not required to handle observability themselves.
 */
export async function runTransaction<T>(
  workspaceId: string,
  userId: string,
  handler: (ctx: TransactionContext) => Promise<T>,
  correlationId?: string
): Promise<TransactionResult<T>> {
  const resolvedCorrelationId = correlationId ?? generateTraceId();
  const outbox = createOutbox();

  const ctx: TransactionContext = { workspaceId, correlationId: resolvedCorrelationId, outbox };
  const value = await handler(ctx);

  // Drain events from the outbox and append to the event store (best-effort)
  const events = outbox.drain();
  for (const event of events) {
    await appendDomainEvent(workspaceId, {
      eventType: event.type,
      payload: event.payload as unknown as Record<string, unknown>,
      aggregateId: workspaceId,
      correlationId: resolvedCorrelationId,
      causedBy: userId,
    }).catch((appendErr: unknown) => {
      // Event store append is best-effort — do not fail the command
      logDomainError({
        occurredAt: new Date().toISOString(),
        traceId: resolvedCorrelationId,
        source: 'workspace-application:transaction-runner',
        message: 'Failed to append event to store',
        detail: appendErr instanceof Error ? appendErr.stack : String(appendErr),
      });
    });
  }

  return { value, events };
}
