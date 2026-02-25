/**
 * account-organization.skill-tag — _skill-tag-pool.ts
 *
 * Skill Tag Pool: organization-scoped view of the global Tag Authority Center.
 *
 * Per logic-overview_v5.md (VS4):
 *   SKILL_TAG_POOL[("職能標籤庫\naccount-organization.skill-tag\n= Tag Authority 的組織作用域快照\n消費 TagLifecycleEvent 被動更新")]
 *
 * v5 Role Change:
 *   - CENTRALIZED_TAG_AGGREGATE (centralized-tag) is now the global semantic dictionary
 *     and sole authority for tagSlug uniqueness (Invariant #17, A6, T2).
 *   - This pool is the org-scoped activation view: an org activates tags it wants to use
 *     and passively syncs label/category changes from TagLifecycleEvents.
 *   - On tag:deprecated or tag:deleted, the pool entry is updated/removed passively
 *     via syncPoolFromTagEvent() (called by projection.event-funnel).
 *
 * Stored at: orgSkillTagPool/{orgId}/tags/{tagSlug}
 *
 * Invariant T2: SKILL_TAG_POOL = Tag Authority's org-scope read projection;
 *   only tagSlugs from centralized-tag may be activated here.
 */

import {
  setDocument,
  updateDocument,
  deleteDocument,
} from '@/shared/infra/firestore/firestore.write.adapter';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { TagUpdatedPayload, TagDeprecatedPayload, TagDeletedPayload } from '@/features/centralized-tag';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single entry in the org's skill tag pool. */
export interface OrgSkillTagEntry {
  orgId: string;
  /** Portable slug — must match a tagSlug from centralized-tag (Invariant T2). */
  tagSlug: string;
  /** Human-readable display name (snapshot from Tag Authority at activation time, kept in sync via TagLifecycleEvent). */
  tagName: string;
  /** Number of members/partners currently holding this tag. Guards against removal from pool. */
  refCount: number;
  /** Set when the global tag has been deprecated; org-level indicator (passive update T2). */
  deprecatedAt?: string;
  addedBy: string;
  addedAt: string;
}

// ---------------------------------------------------------------------------
// Active domain operations (org explicitly activates a tag from Tag Authority)
// ---------------------------------------------------------------------------

/**
 * Adds a skill tag to the organization pool.
 * The tagSlug MUST already exist in the global centralized-tag dictionary (Invariant T2).
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

// ---------------------------------------------------------------------------
// Passive consumer operations (called by projection.event-funnel on TagLifecycleEvents)
// Invariant T2: SKILL_TAG_POOL passively reflects Tag Authority changes.
// ---------------------------------------------------------------------------

/**
 * Syncs label/category update from the global Tag Authority into all org pools
 * that have activated this tag.
 * Called by registerTagFunnel() on `tag:updated`.
 */
export async function syncTagUpdateToPool(
  orgId: string,
  payload: TagUpdatedPayload
): Promise<void> {
  const path = `orgSkillTagPool/${orgId}/tags/${payload.tagSlug}`;
  const existing = await getDocument<OrgSkillTagEntry>(path);
  if (!existing) return; // org has not activated this tag — no-op

  await updateDocument(path, { tagName: payload.label });
}

/**
 * Marks a pool entry as deprecated when the global tag is deprecated.
 * Called by registerTagFunnel() on `tag:deprecated`.
 * The entry is kept (consumers may still hold references) but flagged.
 */
export async function syncTagDeprecationToPool(
  orgId: string,
  payload: TagDeprecatedPayload
): Promise<void> {
  const path = `orgSkillTagPool/${orgId}/tags/${payload.tagSlug}`;
  const existing = await getDocument<OrgSkillTagEntry>(path);
  if (!existing) return;

  await updateDocument(path, { deprecatedAt: payload.deprecatedAt });
}

/**
 * Removes a pool entry when the global tag is deleted.
 * Called by registerTagFunnel() on `tag:deleted`.
 * Only proceeds if refCount is 0; otherwise logs a warning (governance responsibility).
 */
export async function syncTagDeletionToPool(
  orgId: string,
  payload: TagDeletedPayload
): Promise<void> {
  const path = `orgSkillTagPool/${orgId}/tags/${payload.tagSlug}`;
  const existing = await getDocument<OrgSkillTagEntry>(path);
  if (!existing) return;

  if (existing.refCount > 0) {
    // Governance gap: global tag deleted while org still has active references.
    // Do not delete pool entry; leave for reconciliation.
    return;
  }

  await deleteDocument(path);
}
