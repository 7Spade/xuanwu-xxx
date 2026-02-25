/**
 * @fileoverview shared/lib/skill — Skill domain utilities backed by shared-kernel.
 * No async, no I/O, no React, no Firebase.
 *
 * Cross-BC tier types and computation functions live in @/shared-kernel/skills/skill-tier.
 * This module re-exports them for convenience and adds Account-BC-specific helpers
 * that require SkillGrant (a Firestore-backed Account BC type).
 */

import type { SkillGrant } from '@/shared/types'
import type { SkillRequirement } from '@/shared-kernel/workforce/skill-requirement'
import { getTierRank } from '@/shared-kernel/skills/skill-tier'

// Re-export everything from shared-kernel so callers can use @/shared/lib
// as a single import point for skill rules.
export {
  TIER_DEFINITIONS,
  resolveSkillTier,
  getTier,
  getTierDefinition,
  getTierRank,
  tierSatisfies,
} from '@/shared-kernel/skills/skill-tier';

// ---------------------------------------------------------------------------
// Account BC helper — requires SkillGrant (has Timestamp; stays in shared/lib)
// ---------------------------------------------------------------------------

/**
 * Returns true if the given SkillGrant array satisfies a single SkillRequirement.
 * Matches on `tagSlug` (portable, primary key) with fallback to `tagId` for
 * backward compatibility with older grant records.
 * Does not check quantity — only verifies that the skill & tier threshold is met.
 */
export function grantSatisfiesRequirement(
  grants: SkillGrant[],
  requirement: SkillRequirement
): boolean {
  return grants.some(g => {
    const slugMatch = g.tagSlug === requirement.tagSlug;
    const idMatch = requirement.tagId !== undefined && g.tagId !== undefined && g.tagId === requirement.tagId;
    return (slugMatch || idMatch) && getTierRank(g.tier) >= getTierRank(requirement.minimumTier);
  });
}

