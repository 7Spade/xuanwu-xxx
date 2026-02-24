/**
 * account-organization.skill-tag — _skill-tag-pool.ts
 *
 * Skill Tag Pool Aggregate Root.
 * Manages the flat skill/certification tag library for an organization.
 *
 * Per logic-overview.v3.md:
 *   SKILL_TAG_POOL_AGGREGATE["organization.skill-tag-pool.aggregate（唯一性／刪除規則控制）"]
 *   SKILL_TAG_POOL_AGGREGATE --> SKILL_TAG_POOL
 *
 * Responsibilities:
 *   - Enforce uniqueness of skill tags within an organization (by tagSlug).
 *   - Enforce deletion rules: a tag that is still referenced by members cannot
 *     be deleted (guarded by refCount).
 *   - Members and Partners hold READ-ONLY references to pool entries (by tagSlug).
 *
 * Stored at: orgSkillTagPool/{orgId}/tags/{tagSlug}
 *
 * Invariant (A6): Skill Tag uniqueness and deletion rules are managed ONLY here.
 *   Other modules may only reference a tag by its `tagSlug` — they must not
 *   create or delete pool entries directly.
 */

import {
  setDocument,
  updateDocument,
  deleteDocument,
} from '@/shared/infra/firestore/firestore.write.adapter';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single entry in the org's skill tag pool. */
export interface OrgSkillTagEntry {
  orgId: string;
  /** Portable slug — must match a SkillTag.slug in shared/constants/skills. */
  tagSlug: string;
  /** Human-readable display name (snapshot from skill library at add time). */
  tagName: string;
  /** Number of members/partners currently holding this tag. Guards against deletion. */
  refCount: number;
  addedBy: string;
  addedAt: string;
}

// ---------------------------------------------------------------------------
// Domain operations
// ---------------------------------------------------------------------------

/**
 * Adds a skill tag to the organization pool.
 *
 * Enforces uniqueness: if the tag already exists, returns without error.
 * Tags are referenced by `tagSlug` — a portable, stable identifier.
 */
export async function addSkillTagToPool(
  orgId: string,
  tagSlug: string,
  tagName: string,
  addedBy: string
): Promise<void> {
  const path = `orgSkillTagPool/${orgId}/tags/${tagSlug}`;
  const existing = await getDocument<OrgSkillTagEntry>(path);
  if (existing) return; // idempotent — tag already present

  await setDocument(path, {
    orgId,
    tagSlug,
    tagName,
    refCount: 0,
    addedBy,
    addedAt: new Date().toISOString(),
  } satisfies OrgSkillTagEntry);
}

/**
 * Removes a skill tag from the pool.
 *
 * Deletion rule (Invariant A6): a tag with active references (refCount > 0)
 * cannot be deleted. Callers must release all member/partner assignments first.
 *
 * @throws Error when the tag has active references.
 */
export async function removeSkillTagFromPool(
  orgId: string,
  tagSlug: string
): Promise<void> {
  const path = `orgSkillTagPool/${orgId}/tags/${tagSlug}`;
  const existing = await getDocument<OrgSkillTagEntry>(path);
  if (!existing) return; // already absent — idempotent

  if (existing.refCount > 0) {
    throw new Error(
      `Cannot remove skill tag "${tagSlug}" from org "${orgId}": ` +
        `${existing.refCount} member(s) still reference this tag.`
    );
  }

  await deleteDocument(path);
}

/**
 * Increments the reference count when a member/partner is assigned this tag.
 * Called by account-organization.member and account-organization.partner.
 */
export async function incrementTagRefCount(
  orgId: string,
  tagSlug: string
): Promise<void> {
  const entry = await getDocument<OrgSkillTagEntry>(
    `orgSkillTagPool/${orgId}/tags/${tagSlug}`
  );
  const newCount = (entry?.refCount ?? 0) + 1;
  await updateDocument(`orgSkillTagPool/${orgId}/tags/${tagSlug}`, {
    refCount: newCount,
  });
}

/**
 * Decrements the reference count when a member/partner's tag assignment is removed.
 */
export async function decrementTagRefCount(
  orgId: string,
  tagSlug: string
): Promise<void> {
  const entry = await getDocument<OrgSkillTagEntry>(
    `orgSkillTagPool/${orgId}/tags/${tagSlug}`
  );
  const newCount = Math.max(0, (entry?.refCount ?? 1) - 1);
  await updateDocument(`orgSkillTagPool/${orgId}/tags/${tagSlug}`, {
    refCount: newCount,
  });
}
