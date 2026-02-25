/**
 * shared/observability/error-log.ts
 *
 * DOMAIN_ERROR_LOG node — structured domain error logger.
 *
 * Per logic-overview.v3.md (OBSERVABILITY_LAYER):
 *   WORKSPACE_TRANSACTION_RUNNER --> DOMAIN_ERROR_LOG
 *
 * Provides a structured error-logging interface for domain/application errors.
 * In production, forward entries to your preferred logging backend (e.g. Cloud Logging).
 */

export interface DomainErrorEntry {
  /** ISO 8601 timestamp. */
  readonly occurredAt: string;
  /** Correlation/trace ID of the originating command. */
  readonly traceId: string;
  /** The bounded context or module where the error occurred. */
  readonly source: string;
  /** Human-readable error message. */
  readonly message: string;
  /** Optional serialized error detail. */
  readonly detail?: string;
}

/**
 * Logs a domain error in a structured format.
 * Currently writes to console.error; swap for a real sink in production.
 */
export function logDomainError(entry: DomainErrorEntry): void {
  console.error('[DOMAIN_ERROR_LOG]', JSON.stringify(entry));
}
