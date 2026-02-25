/**
 * centralized-tag — _aggregate.ts
 *
 * CENTRALIZED_TAG_AGGREGATE: global semantic dictionary for tagSlugs.
 *
 * Per logic-overview_v5.md (VS0 Tag Authority Center):
 *   CTA["centralized-tag.aggregate\n【語義字典主數據】\ntagSlug / label / category\ndeprecatedAt / deleteRule\n唯一性 & 刪除規則管理"]
 *
 * Invariants:
 *   #17 — This aggregate is the sole authority for tagSlug uniqueness and deletion rules.
 *   T1  — Consumers must subscribe to TagLifecycleEvent; they must not maintain their own tag data.
 *   A6  — Tag deletion enforced here; consumers hold read-only references.
 *
 * Stored at: tagDictionary/{tagSlug}
 */

import {
  setDocument,
  updateDocument,
  deleteDocument,
} from '@/shared/infra/firestore/firestore.write.adapter';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import { publishTagEvent } from './_bus';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TagDeleteRule = 'allow' | 'block-if-referenced';

export interface CentralizedTagEntry {
  tagSlug: string;
  label: string;
  category: string;
  /** ISO timestamp when the tag was deprecated; absent if not deprecated. */
  deprecatedAt?: string;
  /** Optional replacement tag for consumers holding this slug. */
  replacedByTagSlug?: string;
  deleteRule: TagDeleteRule;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Domain operations
// ---------------------------------------------------------------------------

/**
 * Creates a new tag in the global semantic dictionary.
 * Enforces uniqueness: throws if the tagSlug already exists.
 *
 * Publishes `tag:created`.
 */
export async function createTag(
  tagSlug: string,
  label: string,
  category: string,
  createdBy: string,
  deleteRule: TagDeleteRule = 'block-if-referenced'
): Promise<void> {
  const path = `tagDictionary/${tagSlug}`;
  const existing = await getDocument<CentralizedTagEntry>(path);
  if (existing) {
    throw new Error(
      `Tag "${tagSlug}" already exists in the global dictionary. tagSlug must be unique.`
    );
  }

  const now = new Date().toISOString();
  const entry: CentralizedTagEntry = {
    tagSlug,
    label,
    category,
    deleteRule,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };

  await setDocument(path, entry);

  await publishTagEvent('tag:created', {
    tagSlug,
    label,
    category,
    createdBy,
    createdAt: now,
  });
}

/**
 * Updates the label or category of an existing tag.
 * tagSlug is immutable once created (it is the stable cross-BC reference key).
 *
 * Publishes `tag:updated`.
 */
export async function updateTag(
  tagSlug: string,
  updates: { label?: string; category?: string },
  updatedBy: string
): Promise<void> {
  const path = `tagDictionary/${tagSlug}`;
  const existing = await getDocument<CentralizedTagEntry>(path);
  if (!existing) {
    throw new Error(`Tag "${tagSlug}" not found in global dictionary.`);
  }

  const now = new Date().toISOString();
  const newLabel = updates.label ?? existing.label;
  const newCategory = updates.category ?? existing.category;

  await updateDocument(path, {
    label: newLabel,
    category: newCategory,
    updatedAt: now,
  });

  await publishTagEvent('tag:updated', {
    tagSlug,
    label: newLabel,
    category: newCategory,
    updatedBy,
    updatedAt: now,
  });
}

/**
 * Marks a tag as deprecated.
 * Deprecated tags remain valid references but consumers should migrate to replacedByTagSlug.
 *
 * Publishes `tag:deprecated`.
 */
export async function deprecateTag(
  tagSlug: string,
  deprecatedBy: string,
  replacedByTagSlug?: string
): Promise<void> {
  const path = `tagDictionary/${tagSlug}`;
  const existing = await getDocument<CentralizedTagEntry>(path);
  if (!existing) {
    throw new Error(`Tag "${tagSlug}" not found in global dictionary.`);
  }
  if (existing.deprecatedAt) return; // idempotent

  const now = new Date().toISOString();
  await updateDocument(path, {
    deprecatedAt: now,
    ...(replacedByTagSlug ? { replacedByTagSlug } : {}),
    updatedAt: now,
  });

  await publishTagEvent('tag:deprecated', {
    tagSlug,
    replacedByTagSlug,
    deprecatedBy,
    deprecatedAt: now,
  });
}

/**
 * Deletes a tag from the global dictionary.
 *
 * Deletion rule: if `deleteRule === 'block-if-referenced'` the caller must
 * ensure all consumers have released their references before calling this.
 * This aggregate does NOT track cross-BC reference counts (that would violate #1).
 * The invariant is enforced by convention and governance process.
 *
 * Publishes `tag:deleted`.
 */
export async function deleteTag(tagSlug: string, deletedBy: string): Promise<void> {
  const path = `tagDictionary/${tagSlug}`;
  const existing = await getDocument<CentralizedTagEntry>(path);
  if (!existing) return; // idempotent

  await deleteDocument(path);

  await publishTagEvent('tag:deleted', {
    tagSlug,
    deletedBy,
    deletedAt: new Date().toISOString(),
  });
}

/**
 * Reads a single tag entry from the global dictionary.
 */
export async function getTag(tagSlug: string): Promise<CentralizedTagEntry | null> {
  return getDocument<CentralizedTagEntry>(`tagDictionary/${tagSlug}`);
}
