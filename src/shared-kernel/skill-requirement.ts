/**
 * shared-kernel.skill-requirement
 *
 * Cross-BC staffing contract: describes the skill and headcount needs for a
 * schedule proposal.
 *
 * Flows from Workspace BC → Organization BC via WORKSPACE_OUTBOX events
 * (workspace:schedule:proposed, workspace:document-parser:itemsExtracted).
 *
 * Used by:
 *   - workspace-business.schedule (proposes requirements)
 *   - workspace-business.document-parser (extracts requirements from documents)
 *   - workspace-core.event-bus (carries requirements in event payloads)
 *   - account-organization.schedule (receives and validates requirements)
 *
 * No Firebase deps — pure domain contract.
 */

import type { SkillTier } from './skill-tier';

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
