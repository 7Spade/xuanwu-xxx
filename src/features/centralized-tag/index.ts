/**
 * centralized-tag — Public API
 *
 * CENTRALIZED_TAG_AGGREGATE: global semantic dictionary / Tag Authority Center.
 *
 * Per logic-overview_v5.md (VS0 Tag Authority Center):
 *   - This slice is the sole global authority for tagSlug semantics.
 *   - All other slices hold READ-ONLY tagSlug references; they must not maintain
 *     their own tag master data (Invariant #17, T1).
 *   - TagLifecycleEvents (TagCreated/Updated/Deprecated/Deleted) broadcast
 *     semantic changes to all interested slices via Integration Event Router.
 *
 * Usage: slices that need tag semantics subscribe via onTagEvent().
 */

// Aggregate operations
export {
  createTag,
  updateTag,
  deprecateTag,
  deleteTag,
  getTag,
} from './_aggregate';
export type { CentralizedTagEntry, TagDeleteRule } from './_aggregate';

// Event bus (publish / subscribe)
export { onTagEvent, publishTagEvent } from './_bus';
export type {
  TagLifecycleEventPayloadMap,
  TagLifecycleEventKey,
  TagCreatedPayload,
  TagUpdatedPayload,
  TagDeprecatedPayload,
  TagDeletedPayload,
} from './_events';
