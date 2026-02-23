# Feature Slice: `projection.organization-view`

## Domain

Organization projection view — read model for organization state, populated by organization domain events via the event funnel.

## Responsibilities

- Maintain organization read model updated by organization domain events
- Provide efficient queries for organization data without hitting aggregate directly
- Support UI rendering of organization state

## Internal Files (Projection Slice Specialization)

| File / Dir | Purpose |
|-----------|---------|
| `_projector.ts` | Event → organization read model update |
| `_read-model.ts` | Organization view Firestore schema |
| `_queries.ts` | Organization view queries |
| `index.ts` | Public query hooks / types |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Organization`
- `@/shared/infra/firestore/` — read model Firestore collection

## Architecture Note

`logic-overview.v3.md`: `EVENT_FUNNEL_INPUT → ORGANIZATION_PROJECTION_VIEW`.
This read model is fed exclusively through the event funnel.
