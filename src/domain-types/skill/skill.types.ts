/**
 * @fileoverview Skill & Tag-Badge system — core domain types.
 *
 * Design principles:
 *   - SkillTag        = org-level skill library entry (the "what")
 *   - SkillGrant      = assignment of a skill + tier to an individual user (the "who has it")
 *                       Stored permanently on accounts/{userId} — survives org deletion.
 *   - SkillRequirement = what a schedule proposal needs (the "what is needed")
 *
 * Key decision: XP and skill grants belong to the PERSON, not the organisation.
 * `tagSlug` is the portable cross-org identifier; `tagId` is org-local (optional).
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
 * Records that an individual user holds a skill at a given tier.
 *
 * Stored on `accounts/{userId}.skillGrants[]` — permanently attached to the
 * person, not to the organisation.  Survives org deletion, team removal, and
 * partner-contract expiry.
 *
 * `tagSlug` is the portable cross-org identifier (e.g. "electrical-work").
 * `tagId`   is the org-local UUID and is optional for display/linking purposes.
 */
export interface SkillGrant {
  /**
   * Portable, hyphen-separated skill identifier — the primary lookup key.
   * Derived from SkillTag.slug at grant time so the record is self-contained
   * even after the originating organisation is deleted.
   * Example: "electrical-work", "project-management"
   */
  tagSlug: string;
  /** Snapshot of the human-readable tag name at grant time (for display). */
  tagName?: string;
  /** Org-local UUID — optional, only present when the org still exists. */
  tagId?: string;
  /**
   * Proficiency tier — set manually by an admin or derived from `xp` via
   * resolveSkillTier() in domain-rules/skill.
   */
  tier: SkillTier;
  /**
   * Accumulated XP (0–525).
   * Drives tier progression; use resolveSkillTier(xp) to get the tier.
   */
  xp: number;
  /** The organisation in which this XP was earned (audit trail). */
  earnedInOrgId?: string;
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
  /**
   * Portable skill identifier — the primary matching key.
   * Matches SkillGrant.tagSlug on individual user profiles.
   */
  tagSlug: string;
  /** Org-local tag UUID — optional, for UI linking to the tag library. */
  tagId?: string;
  /** Minimum acceptable tier — entities below this tier are excluded. */
  minimumTier: SkillTier;
  /** Number of individuals needed with this skill. */
  quantity: number;
}
