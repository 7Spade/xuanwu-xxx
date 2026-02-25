/**
 * shared/observability/metrics.ts
 *
 * DOMAIN_METRICS node — in-process domain event counter.
 *
 * Per logic-overview.v3.md (OBSERVABILITY_LAYER):
 *   WORKSPACE_EVENT_BUS --> DOMAIN_METRICS
 *
 * Tracks published event counts per event type.
 * Metrics are in-memory and reset on page reload (client) or process restart (server).
 * For production, replace or extend with your preferred telemetry backend.
 */

/** Counter per event type name. */
const counters: Record<string, number> = {};

/**
 * Increments the counter for the given event type.
 * Called by the WorkspaceEventBus on every publish.
 */
export function recordEventPublished(eventType: string): void {
  counters[eventType] = (counters[eventType] ?? 0) + 1;
}

/**
 * Returns a snapshot of all event counters.
 * Useful for debugging and observability dashboards.
 */
export function getEventCounters(): Readonly<Record<string, number>> {
  return { ...counters };
}

/**
 * Resets all counters — intended for tests only.
 */
export function resetEventCounters(): void {
  for (const key of Object.keys(counters)) {
    delete counters[key];
  }
}
