/**
 * projection.account-skill-view — Public API
 *
 * Account skill XP read model.
 * Tier is NEVER stored; callers compute it via resolveSkillTier(xp) from shared/lib.
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ACCOUNT_SKILL_VIEW
 *   ACCOUNT_SKILL_VIEW -.→ getTier 計算（不存 DB）
 */

export { applySkillXpAdded, applySkillXpDeducted } from './_projector';
export { getAccountSkillEntry, getAccountSkillView } from './_queries';
export type { AccountSkillEntry } from './_projector';
