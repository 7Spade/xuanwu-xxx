/**
 * @fileoverview domain-rules/skill — Pure skill-tier domain rules.
 * No async, no I/O, no React, no Firebase.
 */

import type { SkillTier, TierDefinition, SkillGrant, SkillRequirement } from '@/domain-types/skill'

// ---------------------------------------------------------------------------
// Tier definitions (ordered lowest → highest)
// ---------------------------------------------------------------------------

/**
 * Canonical tier table.  Single source of truth for XP bounds, labels and
 * design tokens.  Update this array to add / rename tiers — all downstream
 * helpers derive from it automatically.
 */
export const TIER_DEFINITIONS: readonly TierDefinition[] = [
  { tier: 'apprentice',   rank: 1, label: 'Apprentice',   minXp: 0,   maxXp: 75,  color: '#CCEDEB', cssVar: '--tier-1-apprentice'   },
  { tier: 'journeyman',   rank: 2, label: 'Journeyman',   minXp: 75,  maxXp: 150, color: '#A2C7C7', cssVar: '--tier-2-journeyman'   },
  { tier: 'expert',       rank: 3, label: 'Expert',       minXp: 150, maxXp: 225, color: '#78A1A3', cssVar: '--tier-3-expert'       },
  { tier: 'artisan',      rank: 4, label: 'Artisan',      minXp: 225, maxXp: 300, color: '#4D7A7F', cssVar: '--tier-4-artisan'      },
  { tier: 'grandmaster',  rank: 5, label: 'Grandmaster',  minXp: 300, maxXp: 375, color: '#23545B', cssVar: '--tier-5-grandmaster'  },
  { tier: 'legendary',    rank: 6, label: 'Legendary',    minXp: 375, maxXp: 450, color: '#17393E', cssVar: '--tier-6-legendary'    },
  { tier: 'titan',        rank: 7, label: 'Titan',        minXp: 450, maxXp: 525, color: '#0A1F21', cssVar: '--tier-7-titan'        },
] as const;

// Indexed lookup maps for O(1) access
const TIER_BY_ID = new Map<SkillTier, TierDefinition>(
  TIER_DEFINITIONS.map(d => [d.tier, d] as [SkillTier, TierDefinition])
);

// ---------------------------------------------------------------------------
// Tier lookups
// ---------------------------------------------------------------------------

/** Returns the TierDefinition for the given SkillTier identifier. */
export function getTierDefinition(tier: SkillTier): TierDefinition {
  const def = TIER_BY_ID.get(tier);
  if (!def) throw new Error(`Unknown SkillTier: "${tier}"`);
  return def;
}

/**
 * Derives the SkillTier from a raw XP value.
 * Returns 'apprentice' for out-of-range values below 0,
 * and 'titan' for values above the maximum.
 */
export function resolveSkillTier(xp: number): SkillTier {
  for (const def of TIER_DEFINITIONS) {
    if (xp < def.maxXp) return def.tier;
  }
  return 'titan';
}

/**
 * Returns the numeric rank for a tier (1 = lowest, 7 = highest).
 * Useful for comparison operations.
 */
export function getTierRank(tier: SkillTier): number {
  return getTierDefinition(tier).rank;
}

// ---------------------------------------------------------------------------
// Matching helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if `grantedTier` satisfies the `minimumTier` requirement.
 * A higher (or equal) tier always satisfies a lower minimum.
 */
export function tierSatisfies(grantedTier: SkillTier, minimumTier: SkillTier): boolean {
  return getTierRank(grantedTier) >= getTierRank(minimumTier);
}

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
    return (slugMatch || idMatch) && tierSatisfies(g.tier, requirement.minimumTier);
  });
}
