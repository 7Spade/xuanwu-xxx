/**
 * shared-kernel.schedule-proposed-payload
 *
 * Cross-BC event payload contract for the ScheduleProposed saga.
 *
 * Per logic-overview.v3.md:
 *   WORKSPACE_OUTBOX →|ScheduleProposed（跨層事件 · saga）| ORGANIZATION_SCHEDULE
 *   WORKSPACE_EVENT_BUS -.→|事件契約遵循| SK_EVENT_ENVELOPE
 *
 * This payload crosses the Workspace BC → Organization BC boundary.
 * Placing it in shared-kernel removes the dependency of account-organization.schedule
 * on workspace-core.event-bus (a Workspace BC implementation file).
 *
 * Used by:
 *   - workspace-core.event-bus (produces the event)
 *   - account-organization.schedule (consumes the event — Org BC)
 *
 * No Firebase deps — pure domain contract.
 */

import type { SkillRequirement } from './skill-requirement';

/**
 * Payload carried by the `workspace:schedule:proposed` event.
 *
 * Workspace BC emits this; Organization BC consumes it to create an
 * `OrgScheduleProposal` and run skill-tier eligibility checks.
 *
 * Fields:
 *   scheduleItemId — workspace-local schedule item ID (SourcePointer from Workspace BC)
 *   workspaceId    — the workspace that proposed the schedule
 *   orgId          — the organization that owns the workspace
 *   title          — human-readable schedule title
 *   startDate      — ISO 8601 start date string
 *   endDate        — ISO 8601 end date string
 *   proposedBy     — accountId of the person who proposed the schedule
 *   intentId       — optional SourcePointer to the ParsingIntent that triggered this proposal
 *   skillRequirements — optional staffing requirements extracted from the document
 */
export interface WorkspaceScheduleProposedPayload {
  scheduleItemId: string;
  workspaceId: string;
  orgId: string;
  title: string;
  startDate: string;
  endDate: string;
  proposedBy: string;
  /** SourcePointer: IntentID of the ParsingIntent that triggered this proposal. */
  intentId?: string;
  /** Skill requirements forwarded from ParsingIntent to org-level Schedule for validation. */
  skillRequirements?: SkillRequirement[];
}

/** Marker interface — org schedule handlers that consume this payload must declare conformance. */
export interface ImplementsScheduleProposedPayloadContract {
  readonly implementsScheduleProposedPayload: true;
}
