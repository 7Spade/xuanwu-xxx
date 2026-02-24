/**
 * account-organization.skill-tag — Public API
 *
 * Two aggregates live in this slice:
 *
 * 1. Skill Tag Pool (SKILL_TAG_POOL_AGGREGATE)
 *    Manages uniqueness and deletion rules for org-level skill tags.
 *    Members/Partners hold read-only references by tagSlug.
 *
 * 2. Org Skill Recognition (ORG_SKILL_RECOGNITION)
 *    Records that an org has recognised a member's skill, optionally gating
 *    by minXpRequired.  Publishes SkillRecognitionGranted / SkillRecognitionRevoked
 *    to the org event bus.
 *    Organization may set minXpRequired thresholds but CANNOT modify Account XP
 *    (Invariant #11).
 *
 * Per logic-overview.v3.md:
 *   SKILL_TAG_POOL_AGGREGATE --> SKILL_TAG_POOL
 *   ORG_SKILL_RECOGNITION -->|SkillRecognitionGranted / SkillRecognitionRevoked| ORGANIZATION_EVENT_BUS
 *   SKILL_DEFINITION_AGGREGATE -.->|技能定義參照（skillId · 唯讀）| ORG_SKILL_RECOGNITION
 */

// Skill Tag Pool aggregate
export {
  addSkillTagToPool,
  removeSkillTagFromPool,
  incrementTagRefCount,
  decrementTagRefCount,
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
