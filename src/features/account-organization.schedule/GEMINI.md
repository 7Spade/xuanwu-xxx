# Feature Slice: `account-organization.schedule`

## Domain

HR schedule management — FCM Layer 1. Manages human resource scheduling at the organization level and announces `ScheduleAssigned` facts to the organization event bus.

## Responsibilities

- Receive `ScheduleProposed` cross-layer saga events from `WORKSPACE_OUTBOX` and persist them as `proposed` org schedule proposals (including skill requirements for HR validation)
- Validate member skill eligibility via `projection.org-eligible-member-view` (Invariant #14 — never reads Account aggregate directly)
- Confirm or cancel proposals; publish `organization:schedule:assigned` or `organization:schedule:assignRejected` compensating events (Invariant A5)
- Allow HR governance to manually cancel proposals without assignment (`cancelOrgScheduleProposal`)
- Provide read queries and React hooks for the org governance UI to review pending proposals

## FCM Three-Layer Architecture

| Layer | Slice | Role |
|-------|-------|------|
| **Layer 1 (Trigger)** | **`account-organization.schedule`** | Declares `ScheduleAssigned` fact |
| Layer 2 (Router) | `account-governance.notification-router` | Routes by TargetAccountID |
| Layer 3 (Delivery) | `account-user.notification` | Filters by account tag, pushes FCM |

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_schedule.ts` | Domain service: `handleScheduleProposed`, `approveOrgScheduleProposal`, `cancelOrgScheduleProposal`; aggregate state machine (`draft → proposed → confirmed | cancelled`) |
| `_queries.ts` | `getOrgScheduleProposal`, `subscribeToOrgScheduleProposals`, `subscribeToPendingProposals` |
| `_hooks/use-org-schedule.ts` | `useOrgSchedule`, `usePendingScheduleProposals` React hooks |
| `_components/org-schedule-governance.tsx` | `OrgScheduleGovernance` — HR panel: shows pending proposals with member selection, approve/cancel actions |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export { handleScheduleProposed, approveOrgScheduleProposal, cancelOrgScheduleProposal, orgScheduleProposalSchema, ORG_SCHEDULE_STATUSES } from './_schedule';
export type { OrgScheduleProposal, OrgScheduleStatus, ScheduleApprovalResult } from './_schedule';
export { getOrgScheduleProposal, subscribeToOrgScheduleProposals, subscribeToPendingProposals } from './_queries';
export { useOrgSchedule, usePendingScheduleProposals } from './_hooks/use-org-schedule';
export { OrgScheduleGovernance } from './_components/org-schedule-governance';
```

## App Routes

| Route | Usage |
|-------|-------|
| `app/dashboard/account/org-schedule/page.tsx` | HR governance panel (org-only) |

## Dependencies

- `@/features/account-organization.event-bus` — `publishOrgEvent`
- `@/features/projection.org-eligible-member-view` — `getOrgMemberEligibility` (Invariant #14)
- `@/features/workspace-core.event-bus` — `WorkspaceScheduleProposedPayload` type
- `@/shared/infra/firestore/` — `setDocument`, `updateDocument`
- `@/shared/lib` — `resolveSkillTier`, `tierSatisfies`
- `@/shared/types` — `SkillRequirement`
- `@/shared/app-providers/app-context` — `useApp` (org member list for member selection)
- `@/shared/utility-hooks/use-toast` — toast notifications

## Architecture Note

`logic-overview.v3.md`:
- `WORKSPACE_OUTBOX →|ScheduleProposed（跨層事件 · saga）| ORGANIZATION_SCHEDULE`
- `ORGANIZATION_SCHEDULE →|ScheduleAssigned 事件| ORGANIZATION_EVENT_BUS`
- Invariant #14: reads `projection.org-eligible-member-view` only — never Account aggregate
- Invariant #12: tier derived via `resolveSkillTier(xp)` at runtime — never stored in DB
- Invariant A5: `ScheduleAssignRejected` is the compensating event for failed assignments
- `cancelOrgScheduleProposal`: HR explicit withdrawal — no assignment attempted, no compensating event
