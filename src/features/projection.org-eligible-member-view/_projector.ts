/**
 * projection.org-eligible-member-view — _projector.ts
 *
 * Organization-scoped eligible member read model.
 * Used exclusively by organization.schedule to determine assignable members
 * and validate skill tier requirements WITHOUT querying Account aggregates directly.
 *
 * Per logic-overview.v3.md invariants:
 *   #12 — Tier is NEVER stored; derived at query time via resolveSkillTier(xp).
 *   #14 — Schedule reads ONLY this projection (org-eligible-member-view).
 *
 * Stored at: orgEligibleMemberView/{orgId}/members/{accountId}
 *
 * Event sources (via EVENT_FUNNEL_INPUT):
 *   organization:skill:xpAdded   → applyOrgMemberSkillXp
 *   organization:skill:xpDeducted → applyOrgMemberSkillXp
 *   organization:member:joined    → initOrgMemberEntry
 *   organization:member:left      → removeOrgMemberEntry
 */

import { serverTimestamp } from 'firebase/firestore';
import { setDocument, updateDocument, deleteDocument } from '@/shared/infra/firestore/firestore.write.adapter';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';

/**
 * Per-member entry stored in Firestore.
 *
 * `skills` maps tagSlug → { xp }.
 * `tier` is intentionally absent — derived at read time via resolveSkillTier(xp).
 * `eligible` is a fast-path flag; consumers SHOULD re-verify via skill requirements.
 */
export interface OrgEligibleMemberEntry {
  orgId: string;
  accountId: string;
  /** Map of skillId (tagSlug) → { xp }. Tier must be derived, never stored. */
  skills: Record<string, { xp: number }>;
  /** True when the member has no active conflicting assignments and is in the org. */
  eligible: boolean;
  readModelVersion: number;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

function memberPath(orgId: string, accountId: string): string {
  return `orgEligibleMemberView/${orgId}/members/${accountId}`;
}

/**
 * Creates a bare eligible-member entry when a member joins the organization.
 */
export async function initOrgMemberEntry(
  orgId: string,
  accountId: string
): Promise<void> {
  await setDocument(memberPath(orgId, accountId), {
    orgId,
    accountId,
    skills: {},
    eligible: true,
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  } satisfies OrgEligibleMemberEntry);
}

/**
 * Removes a member entry when they leave the organization.
 */
export async function removeOrgMemberEntry(
  orgId: string,
  accountId: string
): Promise<void> {
  await deleteDocument(memberPath(orgId, accountId));
}

/**
 * Updates the XP for a specific skill on a member's eligible-member entry.
 * Creates the entry if it does not yet exist.
 *
 * Called when organization:skill:xpAdded or organization:skill:xpDeducted fires.
 */
export async function applyOrgMemberSkillXp(
  orgId: string,
  accountId: string,
  skillId: string,
  newXp: number
): Promise<void> {
  const existing = await getDocument<OrgEligibleMemberEntry>(
    memberPath(orgId, accountId)
  );

  if (existing) {
    await updateDocument(memberPath(orgId, accountId), {
      [`skills.${skillId}`]: { xp: newXp },
      readModelVersion: Date.now(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDocument(memberPath(orgId, accountId), {
      orgId,
      accountId,
      skills: { [skillId]: { xp: newXp } },
      eligible: true,
      readModelVersion: Date.now(),
      updatedAt: serverTimestamp(),
    } satisfies OrgEligibleMemberEntry);
  }
}

/**
 * Updates the eligible flag for a member.
 *
 * Called when:
 *   organization:schedule:assigned → eligible = false (member is now busy)
 *   organization:schedule:completed / organization:schedule:cancelled → eligible = true (member is free)
 *
 * Per Invariant #15: eligible must reflect "no active conflicting assignments".
 */
export async function updateOrgMemberEligibility(
  orgId: string,
  accountId: string,
  eligible: boolean
): Promise<void> {
  await updateDocument(memberPath(orgId, accountId), {
    eligible,
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  });
}
