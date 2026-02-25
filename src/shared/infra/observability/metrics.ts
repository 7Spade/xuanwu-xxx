/**
 * shared/infra/observability/metrics.ts
 *
 * domain-metrics
 *
 * Per logic-overview.v3.md OBSERVABILITY_LAYER:
 *   WORKSPACE_EVENT_BUS --> DOMAIN_METRICS
 *
 * In-process event counter for domain events.  Metrics are intentionally
 * kept in-memory and fire-and-forget so that instrumentation never blocks
 * the command pipeline (Invariant #3: Application Layer coordinates flow only).
 *
 * Upgrade path: replace the in-memory map with calls to Firebase Analytics,
 * Cloud Monitoring, or a custom Firestore metrics collection when persistence
 * is required — callers are insulated from that detail by this module's API.
 */

/**
 * Counters stored in-process (reset on cold start).
 * Keys are event-type strings, e.g. "workspace:tasks:assigned".
 */
const eventCounters: Map<string, number> = new Map();

/**
 * Records one occurrence of a domain event.
 *
 * Called by the event bus publish path so every emitted event is counted.
 * Fire-and-forget — never throws.
 *
 * @param eventType - Namespaced domain event name.
 */
export function recordDomainEvent(eventType: string): void {
  eventCounters.set(eventType, (eventCounters.get(eventType) ?? 0) + 1);
}

/**
 * Returns the current in-process count for a given event type.
 * Useful for lightweight health-check endpoints or admin dashboards.
 */
export function getDomainEventCount(eventType: string): number {
  return eventCounters.get(eventType) ?? 0;
}

/**
 * Returns a snapshot of all in-process event counters.
 * Returns a plain object so it can be JSON-serialised without leaking the Map reference.
 */
export function getAllDomainEventCounts(): Record<string, number> {
  return Object.fromEntries(eventCounters.entries());
}

/**
 * Resets all in-process counters.
 * Primarily useful in tests to ensure counter isolation between test cases.
 */
export function resetDomainEventCounters(): void {
  eventCounters.clear();
}
