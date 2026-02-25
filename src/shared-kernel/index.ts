/**
 * shared-kernel — Public barrel
 *
 * Re-exports all Shared Kernel contracts so consumers can import from
 * "@/shared-kernel" instead of pointing at individual files.
 *
 * Rules (Invariant #8):
 *   - Every export here is an explicitly agreed cross-BC contract.
 *   - No infrastructure dependencies (no Firebase, no React, no I/O).
 *   - All additions must be discussed and agreed upon by the teams that own
 *     each affected Bounded Context before they land here.
 */

// Event envelope — all domain events on any bus must conform to this shape
export type {
  EventEnvelope,
  ImplementsEventEnvelopeContract,
} from './events/event-envelope';

// Authority snapshot — projection slices that expose permission data implement this
export type {
  AuthoritySnapshot,
  ImplementsAuthoritySnapshotContract,
} from './identity/authority-snapshot';

// Skill tier — canonical seven-tier proficiency scale and its pure-function computation
export type { SkillTier, TierDefinition } from './skills/skill-tier';
export {
  TIER_DEFINITIONS,
  getTierDefinition,
  resolveSkillTier,
  getTier,
  getTierRank,
  tierSatisfies,
} from './skills/skill-tier';

// Skill requirement — cross-BC staffing contract for schedule proposals
export type { SkillRequirement } from './workforce/skill-requirement';

// Schedule proposed payload — cross-BC event payload (Workspace BC → Organization BC saga)
export type {
  WorkspaceScheduleProposedPayload,
  ImplementsScheduleProposedPayloadContract,
} from './workforce/schedule-proposed-payload';
