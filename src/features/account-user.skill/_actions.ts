/**
 * account-user.skill — _actions.ts
 *
 * Server-side action wrappers for the AccountSkill aggregate.
 *
 * Call path per logic-overview.v3.md:
 *   SERVER_ACTION_SKILL →|addXp / deductXp Command| ACCOUNT_SKILL_AGGREGATE
 *   ACCOUNT_SKILL_AGGREGATE →|clamp 0~525 · 寫入 Ledger| ACCOUNT_SKILL_XP_LEDGER
 *   ACCOUNT_SKILL_AGGREGATE →|SkillXpAdded / SkillXpDeducted| ORGANIZATION_EVENT_BUS
 */

'use server';

import { addXp, deductXp } from './_aggregate';

export interface AddXpInput {
  accountId: string;
  skillId: string;
  delta: number;
  orgId: string;
  reason?: string;
  /** Optional reference to the source domain object (e.g. taskId). */
  sourceId?: string;
}

/**
 * Server Action: add XP to an account's skill.
 * Enforces Ledger write before aggregate update (Invariant #13).
 */
export async function addSkillXp(input: AddXpInput): Promise<{ newXp: number; xpDelta: number }> {
  return addXp(input.accountId, input.skillId, input.delta, {
    orgId: input.orgId,
    reason: input.reason,
    sourceId: input.sourceId,
  });
}

export interface DeductXpInput {
  accountId: string;
  skillId: string;
  delta: number;
  orgId: string;
  reason?: string;
  sourceId?: string;
}

/**
 * Server Action: deduct XP from an account's skill.
 * Enforces Ledger write before aggregate update (Invariant #13).
 */
export async function deductSkillXp(input: DeductXpInput): Promise<{ newXp: number; xpDelta: number }> {
  return deductXp(input.accountId, input.skillId, input.delta, {
    orgId: input.orgId,
    reason: input.reason,
    sourceId: input.sourceId,
  });
}
