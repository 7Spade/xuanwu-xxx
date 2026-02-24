/**
 * projection.account-skill-view — _projector.ts
 *
 * Account skill read model: tracks accountId → skillId → xp.
 *
 * Per logic-overview.v3.md invariants:
 *   #12 — Tier is NEVER stored; always computed via resolveSkillTier(xp).
 *   #14 — Schedule reads this projection; never queries Account aggregate directly.
 *
 * Stored at: accountSkillView/{accountId}/skills/{skillId}
 *
 * Event sources (via EVENT_FUNNEL_INPUT):
 *   organization:skill:xpAdded   → applySkillXpAdded
 *   organization:skill:xpDeducted → applySkillXpDeducted
 */

import { serverTimestamp } from 'firebase/firestore';
import { setDocument } from '@/shared/infra/firestore/firestore.write.adapter';

/**
 * Per-skill entry stored in Firestore.
 * NOTE: `tier` is intentionally absent — derived at read time via resolveSkillTier(xp).
 */
export interface AccountSkillEntry {
  accountId: string;
  /** tagSlug — portable skill identifier (matches SkillGrant.tagSlug). */
  skillId: string;
  /** Clamped XP 0–525. The ONLY persisted skill attribute (Invariant #12). */
  xp: number;
  readModelVersion: number;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

function skillPath(accountId: string, skillId: string): string {
  return `accountSkillView/${accountId}/skills/${skillId}`;
}

/**
 * Applies a SkillXpAdded event to the read model.
 */
export async function applySkillXpAdded(
  accountId: string,
  skillId: string,
  newXp: number
): Promise<void> {
  await setDocument(skillPath(accountId, skillId), {
    accountId,
    skillId,
    xp: newXp,
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  } satisfies AccountSkillEntry);
}

/**
 * Applies a SkillXpDeducted event to the read model.
 */
export async function applySkillXpDeducted(
  accountId: string,
  skillId: string,
  newXp: number
): Promise<void> {
  await setDocument(skillPath(accountId, skillId), {
    accountId,
    skillId,
    xp: newXp,
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  } satisfies AccountSkillEntry);
}
