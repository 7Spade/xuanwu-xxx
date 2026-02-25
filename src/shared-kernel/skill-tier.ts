// Canonical implementation moved to skills/skill-tier.ts
// This file is kept for backward compatibility — import from @/shared-kernel/skills/skill-tier
// or the barrel @/shared-kernel.
export type { SkillTier, TierDefinition } from './skills/skill-tier';
export {
  TIER_DEFINITIONS,
  getTierDefinition,
  resolveSkillTier,
  getTier,
  getTierRank,
  tierSatisfies,
} from './skills/skill-tier';
