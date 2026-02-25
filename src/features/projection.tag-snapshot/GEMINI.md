# Feature Slice: `projection.tag-snapshot`

## Domain

**Tag Lifecycle Views** — final-consistent read model for the global tag dictionary.

## Responsibilities

- Consume TagLifecycleEvents (TagCreated/Updated/Deprecated/Deleted) from the Event Funnel
- Maintain a final-consistent snapshot of `tagSlug / label / category / deprecatedAt`
- Provide read-only query access to tag metadata for all consuming slices

## Invariants Enforced

| # | Invariant | Enforcement |
|---|-----------|-------------|
| T5 | TAG_SNAPSHOT is read-only for consumers | Only Event Funnel projector functions write to `tagSnapshot` |
| #9 | Projection must be fully rebuildable from events | All updates driven by TagLifecycleEvents |
| A7 | Event Funnel composes projections; does not enforce cross-BC invariants | Projector functions are pure appliers |

## Internal Files

| File | Purpose |
|------|---------|
| `_projector.ts` | `applyTagCreated`, `applyTagUpdated`, `applyTagDeprecated`, `applyTagDeleted` |
| `_queries.ts` | `getTagSnapshot`, `getAllTagSnapshots`, `getActiveTagSnapshots` |
| `index.ts` | Public API |

## Firestore Paths

| Path | Data |
|------|------|
| `tagSnapshot/{tagSlug}` | `TagSnapshotEntry` (tagSlug, label, category, deprecatedAt?) |

## Public API (`index.ts`)

```ts
// Projector (called by Event Funnel)
export { applyTagCreated, applyTagUpdated, applyTagDeprecated, applyTagDeleted } from './_projector';
// Queries
export { getTagSnapshot, getAllTagSnapshots, getActiveTagSnapshots } from './_queries';
```

## Dependencies

- `@/features/centralized-tag` — TagLifecycleEvent payload types
- `@/shared/infra/firestore/` — read/write adapters

## Architecture Note

`logic-overview_v5.md` VS8:
- `FUNNEL --> TAG_SNAPSHOT`
- `TAG_SNAPSHOT["projection.tag-snapshot\n來源: TagLifecycleEvent\n消費方唯讀快取"]`
- `TAG_SNAPSHOT -.->|"T5"| TAG_READONLY`
