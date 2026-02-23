# Feature Slice: `account-user.notification`

## Domain

Personal push notification — FCM Layer 3. Receives routed notifications and delivers them to the user device via Firebase Cloud Messaging after filtering sensitive content by account tag.

## Responsibilities

- Receive notifications routed from `account-governance.notification-router`
- Filter notification content based on account tag (internal/external)
- Read FCM token from `account-user.profile` (read-only, never writes to profile)
- Push notification to Firebase Cloud Messaging gateway

## FCM Three-Layer Architecture

| Layer | Slice | Role |
|-------|-------|------|
| Layer 1 (Trigger) | `account-organization.schedule` | Declares fact (ScheduleAssigned) |
| Layer 2 (Router) | `account-governance.notification-router` | Routes by TargetAccountID |
| **Layer 3 (Delivery)** | **`account-user.notification`** | Filters by account tag, pushes FCM |

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_delivery.ts` | FCM token lookup + push delivery |
| `_queries.ts` | User notification list |
| `_components/` | `NotificationList`, `NotificationBadge` |
| `_hooks/` | `useUserNotifications` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Notification`, `AccountTag`
- `@/shared/infra/` — FCM gateway, Firestore reads
- `@/features/account-user.profile` — FCM token (read-only via public API)

## Architecture Note

This slice reads FCM Token from `account-user.profile` — it must only use the profile's public API and must not write to it.
