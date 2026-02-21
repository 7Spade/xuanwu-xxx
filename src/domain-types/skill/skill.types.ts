/**
 * @fileoverview Skill & Tag-Badge system — core domain types.
 *
 * Design principles:
 *   - SkillTag  = a global library entry (the "what")
 *   - SkillGrant = an assignment of a skill + tier to an entity (the "who has it")
 *   - SkillRequirement = what a schedule proposal needs (the "what is needed")
 *
 * Naming is intentionally industry-semantic to support future AI-agent scheduling.
 */

// ---------------------------------------------------------------------------
// Tier system
// ---------------------------------------------------------------------------

/**
 * Seven-tier proficiency scale.
 * Values are stable identifiers (safe for Firestore storage & AI prompts).
 */
export type SkillTier =
  | 'apprentice'    // Tier 1 — 0–75 XP
  | 'journeyman'    // Tier 2 — 75–150 XP
  | 'expert'        // Tier 3 — 150–225 XP
  | 'artisan'       // Tier 4 — 225–300 XP
  | 'grandmaster'   // Tier 5 — 300–375 XP  (core colour)
  | 'legendary'     // Tier 6 — 375–450 XP
  | 'titan';        // Tier 7 — 450–525 XP

/** Static metadata for a single tier. Used by UI and domain-rules. */
export interface TierDefinition {
  tier: SkillTier;
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  label: string;     // Display name  (e.g. "Expert")
  minXp: number;     // Inclusive lower bound
  maxXp: number;     // Exclusive upper bound (except Tier 7 which is open-ended)
  color: string;     // Hex colour for badge background
  cssVar: string;    // CSS custom property name (e.g. "--tier-3-expert")
}

// ---------------------------------------------------------------------------
// Global skill-tag library
// ---------------------------------------------------------------------------

/**
 * A skill definition in the organisation's global tag library.
 * Stored as `Account.skillTags[]` on the organisation document.
 */
export interface SkillTag {
  id: string;
  /** Human-readable name (e.g. "Electrical Work", "Project Management"). */
  name: string;
  /**
   * Machine-readable, hyphen-separated identifier.
   * Used by AI agents and as stable keys in Firestore queries.
   * Example: "electrical-work", "project-management"
   */
  slug: string;
  /** Optional grouping category (e.g. "Construction", "Engineering", "Soft Skills"). */
  category?: string;
  description?: string;
  createdAt: any; // Firestore Timestamp
}

// ---------------------------------------------------------------------------
// Per-entity skill grants (assignments)
// ---------------------------------------------------------------------------

/**
 * Records that a specific entity (Team or MemberReference) holds a skill
 * at a given tier. Stored inline on the entity document.
 */
export interface SkillGrant {
  /** References SkillTag.id from the org's global library. */
  tagId: string;
  /**
   * Proficiency tier — set manually by an admin for now.
   * Can be derived from `xp` via resolveSkillTier() in domain-rules/skill.
   */
  tier: SkillTier;
  /**
   * Optional XP value (0–525).
   * Provides finer-grained progress information within a tier.
   */
  xp?: number;
  /** When the skill was granted / last updated. */
  grantedAt?: any; // Firestore Timestamp
}

// ---------------------------------------------------------------------------
// Schedule staffing requirements
// ---------------------------------------------------------------------------

/**
 * Expresses a staffing need inside a ScheduleItem proposal.
 * Workspace managers specify what skills they require and how many people.
 */
export interface SkillRequirement {
  /** References SkillTag.id from the org's global library. */
  tagId: string;
  /** Minimum acceptable tier — entities below this tier are excluded. */
  minimumTier: SkillTier;
  /** Number of people/teams needed with this skill. */
  quantity: number;
}
