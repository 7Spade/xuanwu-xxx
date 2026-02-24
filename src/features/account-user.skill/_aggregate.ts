/**
 * account-user.skill — _aggregate.ts
 *
 * AccountSkill Aggregate Root.
 *
 * Schema (stored at: accountSkills/{accountId}/skills/{skillId}):
 *   accountId — owner
 *   skillId   — tagSlug (portable identifier)
 *   xp        — accumulated XP, clamped 0–525 (Invariant #13)
 *   version   — optimistic concurrency counter
 *
 * Invariants enforced:
 *   #11 — XP belongs to Account BC; published to Organization via events only.
 *   #12 — Tier is NEVER stored here. Derive via resolveSkillTier(xp) / getTier(xp).
 *   #13 — Every xp change MUST write a ledger entry BEFORE updating the aggregate.
 *
 * Write path per logic-overview.v3.md:
 *   Server Action → addXp/deductXp → clamp 0~525 → appendXpLedgerEntry
 *     → setDocument(aggregate) → publishOrgEvent(SkillXpAdded/Deducted)
 */

import { setDocument } from '@/shared/infra/firestore/firestore.write.adapter';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import { publishOrgEvent } from '@/features/account-organization.event-bus';
import { appendXpLedgerEntry } from './_ledger';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum XP value per skill — matches TIER_DEFINITIONS cap (Titan tier). */
export const SKILL_XP_MAX = 525;
/** Minimum XP value per skill. */
export const SKILL_XP_MIN = 0;

// ---------------------------------------------------------------------------
// Types — no `tier` field (Invariant #12)
// ---------------------------------------------------------------------------

/**
 * Persisted aggregate state.
 * `tier` is intentionally absent — derived at query time via getTier(xp).
 */
export interface AccountSkillRecord {
  accountId: string;
  /** tagSlug — portable, hyphen-separated skill identifier. */
  skillId: string;
  /** Accumulated XP (0–525). The ONLY persisted skill attribute. */
  xp: number;
  /** Optimistic-concurrency version counter. Incremented on every write. */
  version: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clampXp(xp: number): number {
  return Math.max(SKILL_XP_MIN, Math.min(SKILL_XP_MAX, xp));
}

function aggregatePath(accountId: string, skillId: string): string {
  return `accountSkills/${accountId}/skills/${skillId}`;
}

// ---------------------------------------------------------------------------
// Domain operations
// ---------------------------------------------------------------------------

/**
 * Adds XP to an account's skill aggregate.
 *
 * Write path (Invariant #13):
 *   1. Read current aggregate (or default to xp=0).
 *   2. Compute new clamped XP.
 *   3. Append ledger entry (BEFORE aggregate write — audit ordering guarantee).
 *   4. Persist updated aggregate (no tier stored — Invariant #12).
 *   5. Publish `organization:skill:xpAdded` event to org event bus.
 *
 * @param delta  Positive XP amount to add.
 * @param opts.orgId   Organization context for the event payload.
 * @param opts.reason  Human-readable reason for the ledger entry.
 * @param opts.sourceId  Optional source object ID (e.g. taskId, scheduleItemId).
 * @returns The new XP value and the actual applied delta (after clamping).
 */
export async function addXp(
  accountId: string,
  skillId: string,
  delta: number,
  opts: { orgId: string; reason?: string; sourceId?: string }
): Promise<{ newXp: number; xpDelta: number }> {
  const existing = await getDocument<AccountSkillRecord>(
    aggregatePath(accountId, skillId)
  );
  const oldXp = existing?.xp ?? 0;
  const newXp = clampXp(oldXp + delta);
  const actualDelta = newXp - oldXp;

  // Invariant #13: ledger BEFORE aggregate write
  await appendXpLedgerEntry(accountId, {
    skillId,
    delta: actualDelta,
    reason: opts.reason ?? 'addXp',
    sourceId: opts.sourceId,
  });

  await setDocument(aggregatePath(accountId, skillId), {
    accountId,
    skillId,
    xp: newXp,
    version: (existing?.version ?? 0) + 1,
  } satisfies AccountSkillRecord);

  await publishOrgEvent('organization:skill:xpAdded', {
    accountId,
    orgId: opts.orgId,
    skillId,
    xpDelta: actualDelta,
    newXp,
    reason: opts.reason,
  });

  return { newXp, xpDelta: actualDelta };
}

/**
 * Deducts XP from an account's skill aggregate.
 *
 * Mirrors addXp; delta should be positive (the deduction amount).
 * Net XP is clamped at SKILL_XP_MIN (0).
 */
export async function deductXp(
  accountId: string,
  skillId: string,
  delta: number,
  opts: { orgId: string; reason?: string; sourceId?: string }
): Promise<{ newXp: number; xpDelta: number }> {
  const existing = await getDocument<AccountSkillRecord>(
    aggregatePath(accountId, skillId)
  );
  const oldXp = existing?.xp ?? 0;
  const newXp = clampXp(oldXp - delta);
  const actualDelta = newXp - oldXp; // negative

  // Invariant #13: ledger BEFORE aggregate write
  await appendXpLedgerEntry(accountId, {
    skillId,
    delta: actualDelta,
    reason: opts.reason ?? 'deductXp',
    sourceId: opts.sourceId,
  });

  await setDocument(aggregatePath(accountId, skillId), {
    accountId,
    skillId,
    xp: newXp,
    version: (existing?.version ?? 0) + 1,
  } satisfies AccountSkillRecord);

  await publishOrgEvent('organization:skill:xpDeducted', {
    accountId,
    orgId: opts.orgId,
    skillId,
    xpDelta: actualDelta,
    newXp,
    reason: opts.reason,
  });

  return { newXp, xpDelta: actualDelta };
}

/**
 * Returns the current XP for an account's skill.
 * Returns 0 if no record exists.
 *
 * NOTE: Do NOT use this to get tier — call getTier(xp) from shared/lib.
 */
export async function getSkillXp(
  accountId: string,
  skillId: string
): Promise<number> {
  const record = await getDocument<AccountSkillRecord>(
    aggregatePath(accountId, skillId)
  );
  return record?.xp ?? 0;
}
