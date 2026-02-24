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
 */

export {
  initOrgMemberEntry,
  removeOrgMemberEntry,
  applyOrgMemberSkillXp,
} from './_projector';
export { getOrgMemberEligibility, getOrgEligibleMembers } from './_queries';
export type { OrgEligibleMemberEntry } from './_projector';
