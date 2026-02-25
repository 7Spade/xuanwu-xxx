/**
 * projection.org-eligible-member-view — Public API
 *
 * Organization-scoped eligible member read model — the ONLY source
 * organization.schedule may use to check member availability and skill tiers.
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ORG_ELIGIBLE_MEMBER_VIEW
 *   ORG_ELIGIBLE_MEMBER_VIEW -.→ getTier 計算（不存 DB）
 *   W_B_SCHEDULE / ORGANIZATION_SCHEDULE read this view (Invariant #14)
 *
 * Consumer guidance:
 *   - Use getOrgMemberEligibilityWithTier / getOrgEligibleMembersWithTier for
 *     queries that need tier (Schedule, UI).  Tier is computed at query time.
 *   - Use getOrgMemberEligibility / getOrgEligibleMembers when only raw xp is needed
 *     (e.g., internal projector-to-projector data transfer).
 */

export {
  initOrgMemberEntry,
  removeOrgMemberEntry,
  applyOrgMemberSkillXp,
  updateOrgMemberEligibility,
} from './_projector';

export {
  getOrgMemberEligibility,
  getOrgEligibleMembers,
  getOrgMemberEligibilityWithTier,
  getOrgEligibleMembersWithTier,
} from './_queries';

export type {
  OrgEligibleMemberEntry,
} from './_projector';

export type {
  OrgMemberSkillWithTier,
  OrgEligibleMemberView,
} from './_queries';
