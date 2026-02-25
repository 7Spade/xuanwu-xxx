/**
 * shared/infra/observability/trace.ts
 *
 * trace-identifier / correlation-identifier
 *
 * Per logic-overview.v3.md OBSERVABILITY_LAYER:
 *   WORKSPACE_COMMAND_HANDLER --> TRACE_IDENTIFIER
 *   WORKSPACE_TRANSACTION_RUNNER --> TRACE_IDENTIFIER
 *   WORKSPACE_EVENT_BUS --> TRACE_IDENTIFIER
 *
 * Provides stable, monotonic trace IDs used to correlate a command, its
 * resulting aggregate events, and all downstream projections into a single
 * observable unit without coupling Bounded Contexts.
 */

/**
 * Generates a unique trace / correlation identifier.
 *
 * Format: `{timestamp-ms}-{random-base36}` — lexicographically sortable,
 * human-readable, and collision-resistant for typical single-instance usage.
 * Upgrade to UUID v7 if distributed tracing is required in the future.
 */
export function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Structured trace context attached to every command / transaction.
 */
export interface TraceContext {
  /** Globally unique identifier for this trace / transaction. */
  traceId: string;
  /** ISO 8601 timestamp when the trace was created. */
  startedAt: string;
  /** Optional parent trace ID for nested / saga transactions. */
  parentTraceId?: string;
}

/**
 * Creates a new TraceContext.
 *
 * @param parentTraceId - Optional parent trace ID for chained / compensating commands.
 */
export function createTraceContext(parentTraceId?: string): TraceContext {
  return {
    traceId: generateTraceId(),
    startedAt: new Date().toISOString(),
    ...(parentTraceId !== undefined ? { parentTraceId } : {}),
  };
}
