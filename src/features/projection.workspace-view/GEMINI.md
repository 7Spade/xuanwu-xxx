# Feature Slice: `projection.workspace-view`

## Domain

Workspace projection view — read model for workspace state. Populated by the event funnel from workspace domain events.

## Responsibilities

- Maintain workspace read model updated by workspace domain events
- Provide efficient queries for workspace data without hitting aggregate directly
- Support UI rendering of workspace state

## Internal Files (Projection Slice Specialization)

| File / Dir | Purpose |
|-----------|---------|
| `_projector.ts` | Event → read model update function |
| `_read-model.ts` | Firestore read model schema |
| `_queries.ts` | Read model queries |
| `index.ts` | Public query hooks / types |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Workspace`
- `@/shared/infra/firestore/` — read model Firestore collection

## Architecture Note

`logic-overview.v3.md`:
- `EVENT_FUNNEL_INPUT → WORKSPACE_PROJECTION_VIEW`
- This read model is fed exclusively through the event funnel — never written directly from application layer.
- Invariant #9: Must be fully rebuildable from events in the event store.
