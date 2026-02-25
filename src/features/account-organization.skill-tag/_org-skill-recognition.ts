/**
 * account-organization.skill-tag — _org-skill-recognition.ts
 *
 * Organization Skill Recognition Aggregate.
 *
 * Per logic-overview.v3.md:
 *   ORG_SKILL_RECOGNITION["organization-skill-recognition.aggregate
 *     （organizationId / accountId / skillId / minXpRequired / status）"]
 *   ORG_SKILL_RECOGNITION →|SkillRecognitionGranted / SkillRecognitionRevoked| ORGANIZATION_EVENT_BUS
 *
 * Responsibilities:
 *   - Record that an organization has recognised a member's skill proficiency.
 *   - Set `minXpRequired` thresholds — organizations MAY gate recognition
 *     by requiring a minimum XP level.
 *   - Publish SkillRecognitionGranted / SkillRecognitionRevoked events.
 *
 * Integration (read-only reference to SKILL_DEFINITION_AGGREGATE):
 *   - Uses `skillId` (tagSlug) as the stable FK referencing the Capability BC.
 *   - NEVER writes to SKILL_DEFINITION_AGGREGATE or ACCOUNT_SKILL_AGGREGATE.
 *   - Reading skill definitions is read-only: uses the static shared/constants/skills
 *     library (no Firestore read needed for definitions).
 *
 * Boundary constraint:
 *   Organization may set `minXpRequired` (a threshold), but it CANNOT modify
 *   the account's XP — that belongs solely to Account BC (Invariant #11).
 *
 * Stored at: orgSkillRecognition/{orgId}/members/{accountId}/skills/{skillId}
 */

import {
  setDocument,
  updateDocument,
} from '@/shared/infra/firestore/firestore.write.adapter';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import { publishOrgEvent } from '@/features/account-organization.event-bus';
import { findSkill } from '@/shared/constants/skills';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SkillRecognitionStatus = 'active' | 'revoked';

/**
 * Persisted recognition record.
 * `minXpRequired` is the ORG-controlled gate; the account's actual xp is
 * read from projection.org-eligible-member-view — never from this record.
 */
export interface OrgSkillRecognitionRecord {
  organizationId: string;
  accountId: string;
  /**
   * tagSlug — read-only reference to the Capability BC's SKILL_DEFINITION_AGGREGATE.
   * This is the only cross-BC coupling; it is a portable string FK, not a direct
   * object import.  The Capability BC owns the canonical definition; this BC
   * may only reference it by ID.
   */
  skillId: string;
  /**
   * Organization-controlled XP threshold.
   * When set, the organization declares that it only recognises the skill for
   * members who have earned at least this much XP.
   * NOTE: this is a GATE, not a write to Account BC (Invariant #11).
   */
  minXpRequired: number;
  status: SkillRecognitionStatus;
  grantedBy: string;
  grantedAt: string;
  revokedAt?: string;
}

// ---------------------------------------------------------------------------
// Domain operations
// ---------------------------------------------------------------------------

/**
 * Grants skill recognition to an account within an organization.
 *
 * Read-only reference to SKILL_DEFINITION_AGGREGATE (Capability BC):
 *   Validates `skillId` against the static global skill library via findSkill().
 *   This enforces the Capability BC boundary — only skills that exist in the
 *   canonical definition library can be recognised.
 *
 * Publishes `organization:skill:recognitionGranted` event.
 *
 * @param minXpRequired  Org-controlled XP gate (0 = no threshold; max 525).
 * @throws Error when `skillId` is not a known skill in the global library.
 */
export async function grantSkillRecognition(
  organizationId: string,
  accountId: string,
  skillId: string,
  grantedBy: string,
  minXpRequired = 0
): Promise<void> {
  // Read-only reference to SKILL_DEFINITION_AGGREGATE (Capability BC — Invariant #8)
  const skillDefinition = findSkill(skillId);
  if (!skillDefinition) {
    throw new Error(
      `Cannot grant recognition for unknown skill "${skillId}". ` +
        `Only skills from the global skill library can be recognised.`
    );
  }
  const path = `orgSkillRecognition/${organizationId}/members/${accountId}/skills/${skillId}`;
  const record: OrgSkillRecognitionRecord = {
    organizationId,
    accountId,
    skillId,
    minXpRequired,
    status: 'active',
    grantedBy,
    grantedAt: new Date().toISOString(),
  };

  await setDocument(path, record);

  await publishOrgEvent('organization:skill:recognitionGranted', {
    organizationId,
    accountId,
    skillId,
    minXpRequired,
    grantedBy,
  });
}

/**
 * Revokes a previously granted skill recognition.
 *
 * Publishes `organization:skill:recognitionRevoked` event.
 */
export async function revokeSkillRecognition(
  organizationId: string,
  accountId: string,
  skillId: string,
  revokedBy: string
): Promise<void> {
  const path = `orgSkillRecognition/${organizationId}/members/${accountId}/skills/${skillId}`;
  const existing = await getDocument<OrgSkillRecognitionRecord>(path);
  if (!existing || existing.status === 'revoked') return; // idempotent

  await updateDocument(path, {
    status: 'revoked' satisfies SkillRecognitionStatus,
    revokedAt: new Date().toISOString(),
  });

  await publishOrgEvent('organization:skill:recognitionRevoked', {
    organizationId,
    accountId,
    skillId,
    revokedBy,
  });
}


