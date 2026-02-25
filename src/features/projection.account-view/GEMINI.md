# Feature Slice: `projection.account-view`

## Domain

Account projection view — read model for account state, including authority snapshots. Implements the `shared-kernel.authority-snapshot` contract.

## Responsibilities

- Maintain account read model populated by account and organization domain events
- Provide authority snapshots for permission checks
- Support notification delivery content filtering by account tag

## Internal Files (Projection Slice Specialization)

| File / Dir | Purpose |
|-----------|---------|
| `_projector.ts` | Event → account read model update |
| `_read-model.ts` | Account view Firestore schema |
| `_queries.ts` | Account view queries |
| `index.ts` | Public query hooks / types |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Account`, `AccountTag`
- `@/shared-kernel/identity/authority-snapshot` — authority snapshot contract (must implement)
- `@/shared/infra/firestore/` — read model Firestore collection

## Architecture Note

`logic-overview.v3.md`:
- `EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_VIEW`
- `ACCOUNT_USER_NOTIFICATION -.→ ACCOUNT_PROJECTION_VIEW` (content filtering by account tag)
- Must implement `shared-kernel.authority-snapshot` contract (invariant #8).
