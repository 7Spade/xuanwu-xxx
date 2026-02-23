# Feature Slice: `projection.account-schedule`

## Domain

Account schedule projection — read model of account availability and scheduling state. Used by `workspace-business.schedule` to filter available accounts for task assignments.

## Responsibilities

- Maintain account schedule availability read model
- Provide filtered available accounts for task schedule generation
- Updated when schedule events are processed through the event funnel

## Internal Files (Projection Slice Specialization)

| File / Dir | Purpose |
|-----------|---------|
| `_projector.ts` | Event → schedule availability update |
| `_read-model.ts` | Account schedule Firestore schema |
| `_queries.ts` | Available account schedule queries |
| `index.ts` | Public query hooks / types |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Account`, `ScheduleItem`
- `@/shared/infra/firestore/` — read model Firestore collection

## Architecture Note

`logic-overview.v3.md`:
- `EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_SCHEDULE`
- `W_B_SCHEDULE -.→ ACCOUNT_PROJECTION_SCHEDULE` (filter available accounts)
This slice is read-only from workspace-business.schedule's perspective.
