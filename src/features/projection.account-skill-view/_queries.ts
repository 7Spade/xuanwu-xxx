/**
 * projection.account-skill-view — _queries.ts
 *
 * Read-side queries for account skill XP.
 * Callers must derive tier via resolveSkillTier(xp) from shared/lib — never read tier from DB.
 *
 * Per logic-overview.v3.md:
 *   W_B_SCHEDULE -.→ ACCOUNT_SKILL_VIEW (読み取り only — via ORG_ELIGIBLE_MEMBER_VIEW)
 */

import { getDocs, collection, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { AccountSkillEntry } from './_projector';

/**
 * Retrieves the skill XP entry for a specific account + skill combination.
 */
export async function getAccountSkillEntry(
  accountId: string,
  skillId: string
): Promise<AccountSkillEntry | null> {
  return getDocument<AccountSkillEntry>(
    `accountSkillView/${accountId}/skills/${skillId}`
  );
}

/**
 * Returns all skill entries for a given account.
 * Callers derive tier via resolveSkillTier(entry.xp).
 */
export async function getAccountSkillView(
  accountId: string
): Promise<AccountSkillEntry[]> {
  const snap = await getDocs(
    collection(db, `accountSkillView/${accountId}/skills`)
  );
  return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as AccountSkillEntry);
}
