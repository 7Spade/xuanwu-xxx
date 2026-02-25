/**
 * projection.tag-snapshot — _projector.ts
 *
 * Tag Authority global read model.
 * Final-consistent snapshot of the global tag dictionary.
 *
 * Per logic-overview_v5.md (VS8 Tag Lifecycle Views):
 *   TAG_SNAPSHOT["projection.tag-snapshot\ntagSlug / label / category\n組織作用域快照\n來源: TagLifecycleEvent\n消費方唯讀快取"]
 *
 * Invariants:
 *   T5 — TAG_SNAPSHOT is the final-consistent read model; consumers must not write.
 *   #9  — Projections must be fully rebuildable from events.
 *   A7  — Event Funnel composes projections; does not enforce cross-BC invariants.
 *
 * Stored at: tagSnapshot/{tagSlug}
 */

import { setDocument, updateDocument, deleteDocument } from '@/shared/infra/firestore/firestore.write.adapter';
import type { TagCreatedPayload, TagUpdatedPayload, TagDeprecatedPayload, TagDeletedPayload } from '@/features/centralized-tag';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TagSnapshotEntry {
  tagSlug: string;
  label: string;
  category: string;
  /** Present when the tag has been deprecated. */
  deprecatedAt?: string;
  /** Suggested replacement tag, if specified at deprecation time. */
  replacedByTagSlug?: string;
  readModelVersion: number;
}

// ---------------------------------------------------------------------------
// Projector functions (called by Event Funnel — Invariant A7)
// ---------------------------------------------------------------------------

export async function applyTagCreated(payload: TagCreatedPayload): Promise<void> {
  await setDocument(`tagSnapshot/${payload.tagSlug}`, {
    tagSlug: payload.tagSlug,
    label: payload.label,
    category: payload.category,
    readModelVersion: Date.now(),
  } satisfies TagSnapshotEntry);
}

export async function applyTagUpdated(payload: TagUpdatedPayload): Promise<void> {
  await setDocument(`tagSnapshot/${payload.tagSlug}`, {
    tagSlug: payload.tagSlug,
    label: payload.label,
    category: payload.category,
    readModelVersion: Date.now(),
  } satisfies TagSnapshotEntry);
}

export async function applyTagDeprecated(payload: TagDeprecatedPayload): Promise<void> {
  await updateDocument(`tagSnapshot/${payload.tagSlug}`, {
    deprecatedAt: payload.deprecatedAt,
    ...(payload.replacedByTagSlug ? { replacedByTagSlug: payload.replacedByTagSlug } : {}),
    readModelVersion: Date.now(),
  });
}

export async function applyTagDeleted(payload: TagDeletedPayload): Promise<void> {
  await deleteDocument(`tagSnapshot/${payload.tagSlug}`);
}
