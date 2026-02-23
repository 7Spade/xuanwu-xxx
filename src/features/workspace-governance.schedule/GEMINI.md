# Feature Slice: `workspace-governance.schedule`

## Domain

Schedule management — schedule items, shift proposals, member assignment, governance (approve/reject).

## Responsibilities

- CRUD for schedule items
- Assign / unassign members to schedule items
- Proposal workflow (create → review → approve / reject)
- Governance sidebar with decision history
- Account-level and workspace-level schedule views
- Unified calendar grid

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createScheduleItem`, `updateScheduleStatus`, `assignMember`, `unassignMember`, `approveScheduleItem`, `rejectScheduleItem` |
| `_queries.ts` | `onSnapshot` listeners for schedule items (account-wide + per-workspace) |
| `_types.ts` | `ScheduleFormValues`, `ProposalFormValues` |
| `_hooks/` | `useGlobalSchedule`, `useWorkspaceSchedule`, `useScheduleCommands` |
| `_components/` | `AccountScheduleSection`, `WorkspaceSchedule`, `GovernanceSidebar`, `ScheduleProposalContent`, `ScheduleDataTable`, `UnifiedCalendarGrid`, `ProposalDialog`, `DecisionHistoryColumns`, `UpcomingEventsColumns` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { AccountScheduleSection } from "./_components/schedule.account-view";
export { WorkspaceSchedule } from "./_components/schedule.workspace-view";
export { GovernanceSidebar } from "./_components/governance-sidebar";
export { ScheduleProposalContent } from "./_components/schedule-proposal-content";
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
