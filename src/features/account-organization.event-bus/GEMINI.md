# Feature Slice: `account-organization.event-bus`

## Domain

Organization event bus — publish/subscribe engine for organization-level domain events. Bridges organization domain events to downstream consumers (workspace policy cache, notification router, projection layer).

## Responsibilities

- Define all organization-level event names and payload types
- Provide `OrganizationEventBus` class (Observer pattern)
- Bridge events to: `workspace-application` (org-policy-cache) and `account-governance.notification-router`

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_bus.ts` | `OrganizationEventBus` implementation |
| `_events.ts` | Organization event names and payload types |
| `_context.ts` | `OrganizationEventContext` + `useOrganizationEvents` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared-kernel/events/event-envelope` — shared event envelope contract (must implement)

## Architecture Note

`logic-overview.v3.md`:
- `ORGANIZATION_ENTITY → ORGANIZATION_EVENT_BUS`
- `ORGANIZATION_EVENT_BUS → ORGANIZATION_SCHEDULE` (policy change events)
- `ORGANIZATION_EVENT_BUS → WORKSPACE_ORG_POLICY_CACHE`
This bus must implement the `shared-kernel.event-envelope` contract (invariant #8).
