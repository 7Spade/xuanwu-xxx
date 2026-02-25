/**
 * shared/infra/observability — Public API
 *
 * Observability cross-cutting concerns for the application.
 *
 * Per logic-overview.v3.md OBSERVABILITY_LAYER:
 *   WORKSPACE_COMMAND_HANDLER --> TRACE_IDENTIFIER
 *   WORKSPACE_TRANSACTION_RUNNER --> TRACE_IDENTIFIER
 *   WORKSPACE_EVENT_BUS --> TRACE_IDENTIFIER
 *   WORKSPACE_TRANSACTION_RUNNER --> DOMAIN_ERROR_LOG
 *   WORKSPACE_EVENT_BUS --> DOMAIN_METRICS
 *
 * Per tree.md:
 *   Observability（trace-identifier · domain-metrics · domain-error-log）
 *   屬橫切關注點，實作置於 shared/infra/observability/，不作為獨立功能切片。
 *
 * Three modules:
 *   trace      — generate/hold TraceContext for command + event correlation
 *   metrics    — count domain events emitted by the event bus
 *   error-log  — structured error recording from the transaction runner
 */

// Trace identifier
export {
  generateTraceId,
  createTraceContext,
} from './trace';
export type { TraceContext } from './trace';

// Domain metrics
export {
  recordDomainEvent,
  getDomainEventCount,
  getAllDomainEventCounts,
  resetDomainEventCounters,
} from './metrics';

// Domain error log
export {
  recordDomainError,
  getDomainErrors,
  clearDomainErrors,
} from './error-log';
export type { DomainErrorEntry } from './error-log';
