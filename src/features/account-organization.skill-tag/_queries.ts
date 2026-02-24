/**
 * account-organization.skill-tag — _queries.ts
 *
 * Read queries for the Skill Tag Pool and Org Skill Recognition aggregates.
 *
 * Per logic-overview.v3.md:
 *   SKILL_TAG_POOL_AGGREGATE → SKILL_TAG_POOL (read model)
 *   ORG_SKILL_RECOGNITION["...organizationId / accountId / skillId / minXpRequired / status"]
 *
 * Boundary constraint:
 *   These queries read ONLY this BC's own Firestore collections.
 *   They do NOT read Account XP data — use projection.org-eligible-member-view for that.
 */

import { getDocs, collection, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { OrgSkillTagEntry } from './_skill-tag-pool';
import type { OrgSkillRecognitionRecord } from './_org-skill-recognition';

// ---------------------------------------------------------------------------
// Skill Tag Pool queries
// ---------------------------------------------------------------------------

/**
 * Retrieves a single skill tag from the org pool by tagSlug.
 * Returns null if the tag is not in the pool.
 */
export async function getOrgSkillTag(
  orgId: string,
  tagSlug: string
): Promise<OrgSkillTagEntry | null> {
  return getDocument<OrgSkillTagEntry>(`orgSkillTagPool/${orgId}/tags/${tagSlug}`);
}

/**
 * Returns all skill tags currently in the organization's pool.
 * Used by UI to display and manage the org's skill tag library.
 */
export async function getOrgSkillTags(orgId: string): Promise<OrgSkillTagEntry[]> {
  const snap = await getDocs(collection(db, `orgSkillTagPool/${orgId}/tags`));
  return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as OrgSkillTagEntry);
}

// ---------------------------------------------------------------------------
// Org Skill Recognition queries
// ---------------------------------------------------------------------------

/**
 * Returns the current recognition record for a specific member skill, or null.
 *
 * Primary consumer: domain operations that need to check recognition status
 * before granting/revoking, and UI that shows recognition state per skill.
 */
export async function getSkillRecognition(
  organizationId: string,
  accountId: string,
  skillId: string
): Promise<OrgSkillRecognitionRecord | null> {
  return getDocument<OrgSkillRecognitionRecord>(
    `orgSkillRecognition/${organizationId}/members/${accountId}/skills/${skillId}`
  );
}

/**
 * Returns all skill recognition records for a specific member within an org.
 * Includes both active and revoked records for full audit visibility.
 *
 * Used by member profile UI to display org-recognised skill credentials.
 */
export async function getMemberSkillRecognitions(
  organizationId: string,
  accountId: string
): Promise<OrgSkillRecognitionRecord[]> {
  const snap = await getDocs(
    collection(db, `orgSkillRecognition/${organizationId}/members/${accountId}/skills`)
  );
  return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as OrgSkillRecognitionRecord);
}
