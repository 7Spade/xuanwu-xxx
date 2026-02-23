# Feature Slice: `workspace-business.schedule`

## Domain

Task schedule generation — generates and manages task schedules within a workspace, triggered by task assignments and time changes. Distinct from HR scheduling (`account-organization.schedule`).

## Distinction from `workspace-governance.schedule` and `account-organization.schedule`

| Slice | Scope | Trigger |
|-------|-------|---------|
| `workspace-governance.schedule` | Workspace-level schedule proposals & decisions | Governance actions |
| `workspace-business.schedule` | Task schedule generation within workspace | Task assignment / time changes |
| `account-organization.schedule` | HR scheduling (workforce) | Organization-level assignments |

## Responsibilities

- Generate task schedules based on task assignments and time changes
- Filter available accounts using `projection.account-schedule`
- Provide schedule proposals for task planning

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `generateSchedule`, `updateSchedule` |
| `_queries.ts` | Task schedule subscription |
| `_components/` | `TaskScheduleView`, `ScheduleProposalCard` |
| `_hooks/` | `useTaskSchedule` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `ScheduleItem`, `Task`
- `@/features/projection.account-schedule` — filtered available accounts (via public API)
- `@/shared/infra/firestore/` — Firestore reads/writes

## Architecture Note

`logic-overview.v3.md`:
- `TRACK_A_TASKS -.→ W_B_SCHEDULE` (task allocation / time change triggers)
- `W_B_SCHEDULE -.→ ACCOUNT_PROJECTION_SCHEDULE` (filter available accounts from projection)
- `WORKSPACE_OUTBOX → ScheduleProposed (cross-layer event) → ORGANIZATION_SCHEDULE`
