# Feature Slice: `account-organization.schedule`

## Domain

HR schedule management — FCM Layer 1. Manages human resource scheduling at the organization level and announces `ScheduleAssigned` facts to the organization event bus.

## Responsibilities

- Manage workforce scheduling assignments for organization accounts
- Publish `ScheduleAssigned` events (Layer 1 trigger — declares fact, does not handle routing)
- Consume schedule-related events from `account-organization.event-bus`

## FCM Three-Layer Architecture

| Layer | Slice | Role |
|-------|-------|------|
| **Layer 1 (Trigger)** | **`account-organization.schedule`** | Declares `ScheduleAssigned` fact |
| Layer 2 (Router) | `account-governance.notification-router` | Routes by TargetAccountID |
| Layer 3 (Delivery) | `account-user.notification` | Filters by account tag, pushes FCM |

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `assignSchedule`, `updateSchedule`, `cancelSchedule` |
| `_queries.ts` | Schedule subscription for org accounts |
| `_components/` | `ScheduleBoard`, `ScheduleAssignForm` |
| `_hooks/` | `useOrgSchedule` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `ScheduleItem`, `Account`
- `@/shared/infra/firestore/` — Firestore reads/writes

## Architecture Note

`logic-overview.v3.md`: `ORGANIZATION_SCHEDULE → ScheduleAssigned event → ORGANIZATION_EVENT_BUS`.
This slice is the **trigger layer only**. It announces facts; it must not know who receives the notification.
