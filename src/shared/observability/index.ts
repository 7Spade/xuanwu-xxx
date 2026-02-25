/**
 * shared/observability/index.ts
 *
 * OBSERVABILITY_LAYER — public API
 *
 * Per logic-overview.v3.md:
 *   WORKSPACE_COMMAND_HANDLER --> TRACE_IDENTIFIER
 *   WORKSPACE_TRANSACTION_RUNNER --> TRACE_IDENTIFIER
 *   WORKSPACE_EVENT_BUS --> TRACE_IDENTIFIER
 *   WORKSPACE_TRANSACTION_RUNNER --> DOMAIN_ERROR_LOG
 *   WORKSPACE_EVENT_BUS --> DOMAIN_METRICS
 */
export { generateTraceId, createTraceContext, type TraceContext } from './trace';
export { recordEventPublished, getEventCounters, resetEventCounters } from './metrics';
export { logDomainError, type DomainErrorEntry } from './error-log';
