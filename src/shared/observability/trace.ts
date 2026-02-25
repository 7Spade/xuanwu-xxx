/**
 * shared/observability/trace.ts
 *
 * TRACE_IDENTIFIER node — correlation/trace ID generation and propagation.
 *
 * Per logic-overview.v3.md (OBSERVABILITY_LAYER):
 *   WORKSPACE_COMMAND_HANDLER --> TRACE_IDENTIFIER
 *   WORKSPACE_TRANSACTION_RUNNER --> TRACE_IDENTIFIER
 *   WORKSPACE_EVENT_BUS --> TRACE_IDENTIFIER
 */

/**
 * Generates a unique correlation/trace identifier for a command or event chain.
 * Format: "<timestamp>-<random>" — lightweight, no external dependency.
 */
export function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Structured trace context attached to commands and events.
 */
export interface TraceContext {
  /** Unique trace identifier for the entire command/event chain. */
  readonly traceId: string;
  /** ISO 8601 timestamp when the trace was initiated. */
  readonly initiatedAt: string;
  /** Optional: the command or event type that started this trace. */
  readonly source?: string;
}

/**
 * Creates a TraceContext for a new command or event chain.
 */
export function createTraceContext(source?: string): TraceContext {
  return {
    traceId: generateTraceId(),
    initiatedAt: new Date().toISOString(),
    source,
  };
}
