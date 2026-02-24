# Feature Slice: `account-governance.notification-router`

## Domain

Notification router — FCM Layer 2. Receives events from the organization event bus and distributes them to the correct target account notification slice based on `TargetAccountID`.

## Responsibilities

- Subscribe to `ScheduleAssigned` and other relevant organization events
- Route notifications to the correct target account (`account-user.notification`) based on `TargetAccountID`
- Does NOT generate notifications itself; only routes from event source to delivery slice

## FCM Three-Layer Architecture

| Layer | Slice | Role |
|-------|-------|------|
| Layer 1 (Trigger) | `account-organization.schedule` | Declares fact (ScheduleAssigned), no routing |
| **Layer 2 (Router)** | **`account-governance.notification-router`** | Routes by TargetAccountID |
| Layer 3 (Delivery) | `account-user.notification` | Filters content by account tag and pushes FCM |

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_router.ts` | Event subscription + TargetAccountID routing logic |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
import { registerNotificationRouter } from '@/features/account-governance.notification-router'
// Returns { unsubscribe } — call at workspace/app startup
```

## Dependencies

- `@/shared/types` — notification event types
- `@/shared/infra/` — event bus subscription
