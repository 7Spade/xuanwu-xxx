/**
 * account-organization.skill-tag — Public API
 *
 * Two aggregates live in this slice:
 *
 * 1. Skill Tag Pool (SKILL_TAG_POOL)
 *    Organization-scoped view of the global Tag Authority Center (centralized-tag).
 *    Per v5: passively updated by TagLifecycleEvents; orgs activate tags from global dictionary.
 *    Per Invariant T2: SKILL_TAG_POOL = Tag Authority's org-scope projection.
 *
 * 2. Org Skill Recognition (ORG_SKILL_RECOGNITION)
 *    Records that an org has recognised a member's skill, optionally gating
 *    by minXpRequired.  Publishes SkillRecognitionGranted / SkillRecognitionRevoked
 *    to the org event bus.
 *    Organization may set minXpRequired thresholds but CANNOT modify Account XP
 *    (Invariant #11).
 *
 * Per logic-overview_v5.md:
 *   SKILL_TAG_POOL = "= Tag Authority 的組織作用域快照\n消費 TagLifecycleEvent 被動更新"
 *   ORG_SKILL_RECOGNITION --> ORG_EVENT_BUS (SkillRecognitionGranted/Revoked)
 */

// Skill Tag Pool aggregate (active operations — org activates tags from global dictionary)
export {
  addSkillTagToPool,
  removeSkillTagFromPool,
  incrementTagRefCount,
  decrementTagRefCount,
  // Passive consumer operations (called by projection.event-funnel on TagLifecycleEvents)
  syncTagUpdateToPool,
  syncTagDeprecationToPool,
  syncTagDeletionToPool,
} from './_skill-tag-pool';
export type { OrgSkillTagEntry } from './_skill-tag-pool';

// Org Skill Recognition aggregate
export {
  grantSkillRecognition,
  revokeSkillRecognition,
} from './_org-skill-recognition';
export type {
  OrgSkillRecognitionRecord,
  SkillRecognitionStatus,
} from './_org-skill-recognition';

// Read queries (Skill Tag Pool + Org Skill Recognition)
export {
  getOrgSkillTag,
  getOrgSkillTags,
  getSkillRecognition,
  getMemberSkillRecognitions,
} from './_queries';
