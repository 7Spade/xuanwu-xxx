# Feature Slice: `workspace-business.schedule`

## Domain

Schedule management — schedule items, shift proposals, member assignment, governance (approve/reject).
Migrated from `workspace-governance.schedule` per `logic-overview.v3.md` (`W_B_SCHEDULE` is in `WORKSPACE_BUSINESS`; `WORKSPACE_GOVERNANCE` only contains `members` + `role`).

Distinct from HR scheduling (`account-organization.schedule`).

## Distinction from `account-organization.schedule`

| Slice | Scope | Trigger |
|-------|-------|---------|
| `workspace-business.schedule` | Workspace schedule items, proposals & decisions | Governance actions / task assignment |
| `account-organization.schedule` | HR scheduling (workforce) | Organization-level assignments |

## Responsibilities

- CRUD for schedule items
- Assign / unassign members to schedule items
- Proposal workflow (create → review → approve / reject)
- Governance sidebar with decision history
- Account-level and workspace-level schedule views
- Unified calendar grid
- Fire `ScheduleProposed` cross-layer event → `WORKSPACE_OUTBOX → ORGANIZATION_SCHEDULE`

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createScheduleItem`, `updateScheduleItemStatus`, `assignMember`, `unassignMember`, `getScheduleItems` |
| `_hooks/use-global-schedule.ts` | `useGlobalSchedule` — account-wide schedule data (pending proposals, decision history, upcoming/present events) |
| `_hooks/use-workspace-schedule.ts` | `useWorkspaceSchedule` — workspace-scoped schedule state and calendar navigation |
| `_hooks/use-schedule-commands.ts` | `useScheduleActions` — assign/unassign member, approve/reject item; reads `projection.account-schedule` for availability checks and `projection.org-eligible-member-view` for soft skill-eligibility guard (Invariants #14 + #12) |
| `_hooks/use-schedule-event-handler.ts` | `useScheduleEventHandler` — subscribes to `workspace:issues:resolved` for discrete B-track recovery (Invariant #2) |
| `_components/` | `AccountScheduleSection`, `WorkspaceSchedule`, `GovernanceSidebar`, `ScheduleProposalContent`, `ScheduleDataTable`, `UnifiedCalendarGrid`, `ProposalDialog` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export { AccountScheduleSection } from './_components/schedule.account-view';
export { WorkspaceSchedule } from './_components/schedule.workspace-view';
export { GovernanceSidebar } from './_components/governance-sidebar';
export { ProposalDialog } from './_components/proposal-dialog';
export { ScheduleProposalContent } from './_components/schedule-proposal-content';
export { ScheduleDataTable } from './_components/schedule-data-table';
export { UnifiedCalendarGrid } from './_components/unified-calendar-grid';
export { useGlobalSchedule } from './_hooks/use-global-schedule';
export { useScheduleActions } from './_hooks/use-schedule-commands';
export { useWorkspaceSchedule } from './_hooks/use-workspace-schedule';
export { useScheduleEventHandler } from './_hooks/use-schedule-event-handler';
export { createScheduleItem, assignMember, unassignMember, updateScheduleItemStatus, getScheduleItems } from './_actions';
```

## Business Rules

- `canTransitionScheduleStatus(from, to)` → lives in `@/shared/lib`
- Only OFFICIAL status triggers entity XP calculation
- Governance uses dual-role approval (proposer ≠ approver)

## Who Uses This Slice?

- `app/dashboard/account/schedule/page.tsx`
- `app/dashboard/workspaces/[id]/@businesstab/schedule/page.tsx`
- `app/dashboard/workspaces/[id]/@modal/(.)schedule-proposal/page.tsx`
- `app/dashboard/workspaces/[id]/@panel/(.)governance/page.tsx`
- `app/dashboard/workspaces/[id]/schedule-proposal/page.tsx`
- `app/dashboard/workspaces/[id]/governance/page.tsx`

## Architecture Note

`logic-overview.v3.md`:
- `TRACK_A_TASKS -.→ W_B_SCHEDULE` (task allocation / time change triggers)
- `W_B_SCHEDULE -.→ ACCOUNT_PROJECTION_SCHEDULE` (filter available accounts from projection)
- `W_B_SCHEDULE -.→ ORG_ELIGIBLE_MEMBER_VIEW` (soft skill-eligibility check before assignment — Invariants #14 + #12)
- `WORKSPACE_OUTBOX → ScheduleProposed (cross-layer event) → ORGANIZATION_SCHEDULE`
