/**
 * projection.org-eligible-member-view — _queries.ts
 *
 * Read-side queries for the org eligible member view.
 * Used by organization.schedule to find and validate assignable members.
 *
 * Tier is NEVER read from Firestore; it is computed at query time via resolveSkillTier(xp)
 * from shared/lib (Invariant #12).
 *
 * Per logic-overview.v3.md:
 *   W_B_SCHEDULE -.→ ORG_ELIGIBLE_MEMBER_VIEW (查詢可用帳號 · eligible=true · 只讀)
 *   ORGANIZATION_SCHEDULE reads this view (Invariant #14)
 *   ORG_ELIGIBLE_MEMBER_VIEW -.→ getTier 計算（不存 DB）
 */

import { getDocs, collection, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import { resolveSkillTier } from '@/shared-kernel/skills/skill-tier';
import type { SkillTier } from '@/shared/types';
import type { OrgEligibleMemberEntry } from './_projector';

// ---------------------------------------------------------------------------
// Computed view types (tier derived at query time — never from DB)
// ---------------------------------------------------------------------------

/**
 * Per-skill entry with tier COMPUTED at query time via resolveSkillTier(xp).
 *
 * This is the shape consumers (Schedule) should use when they need tier for
 * validation or display.  Tier is NOT stored in Firestore (Invariant #12).
 *
 * Maps to the diagram node:
 *   ORG_ELIGIBLE_MEMBER_VIEW["...skillId / xp / tier / eligible..."]
 */
export interface OrgMemberSkillWithTier {
  skillId: string;
  xp: number;
  /** Derived at query time via getTier(xp) — never persisted. */
  tier: SkillTier;
}

/**
 * Full eligible-member view with tier computed for every skill entry.
 * Returned by getOrgMemberEligibilityWithTier / getOrgEligibleMembersWithTier.
 */
export interface OrgEligibleMemberView {
  orgId: string;
  accountId: string;
  /** Skill entries with computed tier. */
  skills: OrgMemberSkillWithTier[];
  eligible: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Computes tier for every skill entry in a raw projection record.
 *
 * resolveSkillTier is a pure O(7) linear scan over the 7-tier table —
 * constant-time per skill.  For typical org sizes this is negligible.
 * Tier is NEVER cached here (Invariant #12); always derived fresh.
 */
function enrichWithTier(entry: OrgEligibleMemberEntry): OrgEligibleMemberView {
  const skills: OrgMemberSkillWithTier[] = Object.entries(entry.skills).map(
    ([skillId, { xp }]) => ({
      skillId,
      xp,
      tier: resolveSkillTier(xp),
    })
  );
  return {
    orgId: entry.orgId,
    accountId: entry.accountId,
    skills,
    eligible: entry.eligible,
  };
}

// ---------------------------------------------------------------------------
// Queries — raw (for internal projector use)
// ---------------------------------------------------------------------------

/**
 * Returns the raw eligible-member entry (xp only, no tier).
 * Prefer getOrgMemberEligibilityWithTier for consumer-facing queries.
 */
export async function getOrgMemberEligibility(
  orgId: string,
  accountId: string
): Promise<OrgEligibleMemberEntry | null> {
  return getDocument<OrgEligibleMemberEntry>(
    `orgEligibleMemberView/${orgId}/members/${accountId}`
  );
}

/**
 * Returns all eligible raw member entries for an organization.
 * Filters by eligible=true so Schedule only sees available members.
 * Prefer getOrgEligibleMembersWithTier for consumer-facing queries.
 */
export async function getOrgEligibleMembers(
  orgId: string
): Promise<OrgEligibleMemberEntry[]> {
  const snap = await getDocs(
    collection(db, `orgEligibleMemberView/${orgId}/members`)
  );
  return snap.docs
    .map((d: QueryDocumentSnapshot) => d.data() as OrgEligibleMemberEntry)
    .filter((e: OrgEligibleMemberEntry) => e.eligible);
}

// ---------------------------------------------------------------------------
// Queries — with computed tier (for Schedule / consumer-facing use)
// ---------------------------------------------------------------------------

/**
 * Returns the eligible-member view with COMPUTED tier for each skill.
 *
 * Satisfies diagram requirement:
 *   ORG_ELIGIBLE_MEMBER_VIEW["...orgId / accountId / skillId / xp / tier / eligible..."]
 *
 * Tier is computed via resolveSkillTier(xp) — never read from DB (Invariant #12).
 */
export async function getOrgMemberEligibilityWithTier(
  orgId: string,
  accountId: string
): Promise<OrgEligibleMemberView | null> {
  const raw = await getOrgMemberEligibility(orgId, accountId);
  if (!raw) return null;
  return enrichWithTier(raw);
}

/**
 * Returns all eligible members with COMPUTED tier for each skill.
 * Filters by eligible=true.
 */
export async function getOrgEligibleMembersWithTier(
  orgId: string
): Promise<OrgEligibleMemberView[]> {
  const rawEntries = await getOrgEligibleMembers(orgId);
  return rawEntries.map(enrichWithTier);
}
