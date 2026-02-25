/**
 * projection.tag-snapshot — Public API
 *
 * TAG_SNAPSHOT: final-consistent global read model for tag lifecycle events.
 *
 * Per logic-overview_v5.md (VS8 Tag Lifecycle Views):
 *   TAG_SNAPSHOT["projection.tag-snapshot\ntagSlug / label / category\n組織作用域快照\n來源: TagLifecycleEvent\n消費方唯讀快取"]
 *
 * Invariant T5: consumers must not write to this collection.
 *
 * Event funnel registration:
 *   Call registerTagFunnel() once at app startup (projection.event-funnel).
 */

// Projector functions (called by Event Funnel)
export {
  applyTagCreated,
  applyTagUpdated,
  applyTagDeprecated,
  applyTagDeleted,
} from './_projector';
export type { TagSnapshotEntry } from './_projector';

// Read queries
export {
  getTagSnapshot,
  getAllTagSnapshots,
  getActiveTagSnapshots,
} from './_queries';
