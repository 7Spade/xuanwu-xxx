/**
 * projection.org-eligible-member-view — _queries.ts
 *
 * Read-side queries for the org eligible member view.
 * Used by organization.schedule to find and validate assignable members.
 *
 * Tier is NEVER read from Firestore; callers compute via resolveSkillTier(xp)
 * from shared/lib (Invariant #12).
 *
 * Per logic-overview.v3.md:
 *   W_B_SCHEDULE -.→ ORG_ELIGIBLE_MEMBER_VIEW (查詢可用帳號 · eligible=true · 只讀)
 *   ORGANIZATION_SCHEDULE reads this view (Invariant #14)
 */

import { getDocs, collection, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { OrgEligibleMemberEntry } from './_projector';

/**
 * Returns the eligible-member entry for a single account in an organization.
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
 * Returns all eligible members for an organization.
 * Filters by eligible=true so Schedule only sees available members.
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
