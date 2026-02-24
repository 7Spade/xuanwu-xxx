/**
 * account-organization.team — _queries.ts
 *
 * Read queries for org-level internal team management.
 *
 * Teams are stored as `accounts/{orgId}.teams[]` (type === 'internal').
 * onSnapshot on the org account document provides real-time updates.
 *
 * Per logic-overview.v3.md:
 *   ORGANIZATION_TEAM["organization-governance.team（團隊管理 · 內部組視圖）"]
 *   ORGANIZATION_TEAM -.->|組內帳號標籤聚合視圖（唯讀）| SKILL_TAG_POOL
 *
 * Boundary constraint:
 *   These queries read ONLY from this org's account document.
 *   Skill tag data is referenced by tagSlug — read from account-organization.skill-tag.
 */

import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { Account, Team } from '@/shared/types';

/**
 * Fetches all internal teams for an organization.
 * Internal teams have `type === 'internal'`.
 */
export async function getOrgTeams(orgId: string): Promise<Team[]> {
  const account = await getDocument<Account>(`accounts/${orgId}`);
  return (account?.teams ?? []).filter((t: Team) => t.type === 'internal');
}

/**
 * Subscribes to real-time updates of an organization's internal team list.
 * Teams are stored inline on the organization account document.
 * Returns an unsubscribe function.
 */
export function subscribeToOrgTeams(
  orgId: string,
  onUpdate: (teams: Team[]) => void
): Unsubscribe {
  const ref = doc(db, 'accounts', orgId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onUpdate([]);
      return;
    }
    const data = snap.data() as Account;
    onUpdate((data.teams ?? []).filter((t: Team) => t.type === 'internal'));
  });
}
