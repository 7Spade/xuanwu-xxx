# Feature Slice: `projection.account-schedule`

## Domain

Account schedule projection — read model of account availability and scheduling state. Used by `workspace-business.schedule` to filter available accounts for task assignments.

## Responsibilities

- Maintain account schedule availability read model (`scheduleProjection/{accountId}`)
- Provide filtered active assignments for task schedule generation
- Updated by `EVENT_FUNNEL_INPUT` when `organization:schedule:assigned` events arrive
- `applyScheduleCompleted` is ready to mark assignments completed when a future `organization:schedule:completed` event is added to the org event bus

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_projector.ts` | Event handlers: `initAccountScheduleProjection`, `applyScheduleAssigned`, `applyScheduleCompleted`; types: `AccountScheduleProjection`, `AccountScheduleAssignment` |
| `_queries.ts` | `getAccountScheduleProjection`, `getAccountActiveAssignments` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export { getAccountScheduleProjection, getAccountActiveAssignments } from './_queries';
export { initAccountScheduleProjection, applyScheduleAssigned, applyScheduleCompleted } from './_projector';
export type { AccountScheduleProjection, AccountScheduleAssignment } from './_projector';
```

## Dependencies

- `@/shared/infra/firestore/` — `setDocument`, `updateDocument`, Firebase `arrayUnion`/`arrayRemove`

## Architecture Note

`logic-overview.v3.md`:
- `EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_SCHEDULE`
- `W_B_SCHEDULE -.→ ACCOUNT_PROJECTION_SCHEDULE` (filter available accounts — Invariant #14)
This slice is read-only from `workspace-business.schedule`'s perspective; writes come only from `projection.event-funnel`.
