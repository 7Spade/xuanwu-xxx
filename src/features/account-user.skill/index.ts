/**
 * account-user.skill — Public API
 *
 * AccountSkill aggregate: addXp / deductXp with mandatory Ledger writes.
 *
 * Per logic-overview.v3.md:
 *   SERVER_ACTION_SKILL → ACCOUNT_SKILL_AGGREGATE → ACCOUNT_SKILL_XP_LEDGER → ORGANIZATION_EVENT_BUS
 *
 * Invariants enforced by this slice:
 *   #11 — XP belongs to Account BC; published to Organization only via events.
 *   #12 — Tier is NEVER stored; derive with getTier(xp) from shared/lib.
 *   #13 — Every XP change produces a Ledger entry BEFORE the aggregate write.
 */

// Server Actions (entry point for UI/API callers)
export { addSkillXp, deductSkillXp } from './_actions';
export type { AddXpInput, DeductXpInput } from './_actions';

// Aggregate domain operations (for use by other server-side slices)
export { addXp, deductXp, getSkillXp, SKILL_XP_MAX, SKILL_XP_MIN } from './_aggregate';
export type { AccountSkillRecord } from './_aggregate';

// Ledger types (for projectors that consume ledger entries)
export type { XpLedgerEntry } from './_ledger';
