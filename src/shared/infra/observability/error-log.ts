/**
 * shared/infra/observability/error-log.ts
 *
 * domain-error-log
 *
 * Per logic-overview.v3.md OBSERVABILITY_LAYER:
 *   WORKSPACE_TRANSACTION_RUNNER --> DOMAIN_ERROR_LOG
 *
 * Structured domain error logger.  Each logged entry captures the trace ID,
 * error message, and relevant context so errors can be correlated back to
 * the originating command without coupling callers to a specific logging
 * backend.
 *
 * Current implementation: in-process ring buffer + console.error.
 * Upgrade path: forward entries to Firebase Crashlytics, Cloud Logging, or a
 * custom Firestore error-log collection without changing caller code.
 */

/**
 * One entry in the domain error log.
 */
export interface DomainErrorEntry {
  /** Trace / correlation ID from the originating transaction. */
  traceId: string;
  /** ISO 8601 timestamp when the error was recorded. */
  occurredAt: string;
  /** The Bounded Context / feature slice that produced the error. */
  source: string;
  /** Human-readable error message. */
  message: string;
  /** Optional structured context for debugging (e.g. workspaceId, command action). */
  context?: Record<string, unknown>;
}

/** In-process ring buffer — retains the last 100 entries. */
const errorBuffer: DomainErrorEntry[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Records a domain error with trace correlation.
 *
 * This is the single write path for the domain error log.  The entry is
 * written to:
 *   1. The in-process ring buffer (for health-check / admin reads).
 *   2. `console.error` (always, for server logs and browser DevTools).
 *
 * Never throws — observability must not break the command pipeline.
 *
 * @param entry - Structured error entry.
 */
export function recordDomainError(entry: DomainErrorEntry): void {
  try {
    if (errorBuffer.length >= MAX_BUFFER_SIZE) {
      errorBuffer.shift();
    }
    errorBuffer.push(entry);
    console.error('[domain-error-log]', JSON.stringify(entry));
  } catch {
    // Fail silently — observability must never break the command path.
  }
}

/**
 * Returns a snapshot of the in-process error ring buffer.
 * Most-recent entries are at the end of the array.
 */
export function getDomainErrors(): readonly DomainErrorEntry[] {
  return errorBuffer.slice();
}

/**
 * Clears the in-process error buffer.
 * Primarily useful in tests to ensure buffer isolation between test cases.
 */
export function clearDomainErrors(): void {
  errorBuffer.length = 0;
}
