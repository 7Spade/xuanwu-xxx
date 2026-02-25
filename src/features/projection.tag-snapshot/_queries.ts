/**
 * projection.tag-snapshot — _queries.ts
 *
 * Read-side queries for the tag snapshot read model.
 *
 * Per logic-overview_v5.md (VS8 Tag Lifecycle Views):
 *   TAG_SNAPSHOT["projection.tag-snapshot\n消費方唯讀快取"]
 *
 * Invariant T5: consumers must not write to this collection.
 *
 * Stored at: tagSnapshot/{tagSlug}
 */

import { collection, getDocs, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { TagSnapshotEntry } from './_projector';

/**
 * Retrieves a single tag snapshot entry by tagSlug.
 * Returns null if the tag does not exist or has been deleted.
 */
export async function getTagSnapshot(tagSlug: string): Promise<TagSnapshotEntry | null> {
  return getDocument<TagSnapshotEntry>(`tagSnapshot/${tagSlug}`);
}

/**
 * Retrieves all tag snapshot entries (global dictionary).
 * Includes deprecated tags unless the caller filters them out.
 */
export async function getAllTagSnapshots(): Promise<TagSnapshotEntry[]> {
  const snap = await getDocs(collection(db, 'tagSnapshot'));
  return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as TagSnapshotEntry);
}

/**
 * Retrieves only active (non-deprecated) tag snapshot entries.
 */
export async function getActiveTagSnapshots(): Promise<TagSnapshotEntry[]> {
  const all = await getAllTagSnapshots();
  return all.filter((t) => !t.deprecatedAt);
}
