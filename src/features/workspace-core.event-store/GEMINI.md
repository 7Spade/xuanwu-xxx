# Feature Slice: `workspace-core.event-store`

## Domain

Workspace event store — append-only log of all workspace domain events. Used exclusively for event replay and audit purposes. Not used for CRUD operations.

## Responsibilities

- Append workspace domain events to the event store
- Support event replay to fully reconstruct Projection read models
- Provide event stream access for audit and observability

## Internal Files (Projection Layer Specialization)

| File / Dir | Purpose |
|-----------|---------|
| `_store.ts` | Append-only event store operations |
| `_replay.ts` | Event replay → feeds into EVENT_FUNNEL_INPUT |
| `_queries.ts` | Event stream queries (audit, replay) |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — workspace event types
- `@/shared/infra/firestore/` — Firestore append-only collection
- `@/shared-kernel/events/event-envelope` — event envelope contract

## Architecture Note

`logic-overview.v3.md`:
- `WORKSPACE_AGGREGATE → WORKSPACE_EVENT_STORE`
- `WORKSPACE_EVENT_STORE -.→ EVENT_FUNNEL_INPUT` (replay only, dotted edge)
- Invariant #9: If event store exists, Projections MUST be fully rebuildable from events; otherwise Event Sourcing must NOT be claimed.
- This slice is **append-only**. No delete or update operations.
