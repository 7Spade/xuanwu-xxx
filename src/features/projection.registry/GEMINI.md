# Feature Slice: `projection.registry`

## Domain

Projection registry — tracks event stream offsets and read model version mappings. Ensures idempotent event processing and provides version tracking for read model consistency.

## Responsibilities

- Track event stream offsets (processed-up-to position) per event stream
- Map read model versions to corresponding event offsets
- Prevent duplicate event processing (idempotency)
- Support cursor-based event catch-up and replay coordination

## Internal Files (Projection Slice Specialization)

| File / Dir | Purpose |
|-----------|---------|
| `_registry.ts` | Offset tracking + version mapping logic |
| `_read-model.ts` | Registry Firestore schema |
| `_queries.ts` | Version and offset queries |
| `index.ts` | Public query hooks / types |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — offset and version types
- `@/shared/infra/firestore/` — registry Firestore collection

## Architecture Note

`logic-overview.v3.md`:
- `EVENT_FUNNEL_INPUT → PROJECTION_VERSION` (update stream offset on each event)
- `PROJECTION_VERSION → READ_MODEL_REGISTRY` (provides read-model version mapping)
This slice is the single source of truth for projection consistency tracking.
