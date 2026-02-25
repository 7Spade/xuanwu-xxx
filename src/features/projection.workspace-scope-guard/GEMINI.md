# Feature Slice: `projection.workspace-scope-guard`

## Domain

Scope Guard dedicated read model — a specialized workspace read model used exclusively by `workspace-application`'s scope guard. Keeps workspace access state consistent without direct event bus dependency.

## Responsibilities

- Maintain the scope guard read model populated via the event funnel
- Provide the single source of truth for workspace access validation queries
- Updated via `WORKSPACE_ORG_POLICY_CACHE` when organization policies change

## Internal Files (Projection Slice Specialization)

| File / Dir | Purpose |
|-----------|---------|
| `_projector.ts` | Event → scope guard read model update |
| `_read-model.ts` | Scope guard Firestore schema |
| `_queries.ts` | Scope guard queries |
| `index.ts` | Public query API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — workspace scope types
- `@/shared-kernel/identity/authority-snapshot` — authority snapshot contract (must implement)
- `@/shared/infra/firestore/` — read model Firestore collection

## Architecture Note

`logic-overview.v3.md`:
- `ACTIVE_ACCOUNT_CONTEXT → (query key) → WORKSPACE_SCOPE_READ_MODEL → WORKSPACE_SCOPE_GUARD`
- `WORKSPACE_ORG_POLICY_CACHE → (update local read model) → WORKSPACE_SCOPE_READ_MODEL`
- Invariant #7: Scope Guard reads ONLY this local read model, NEVER directly from external event buses.
- Must implement `shared-kernel.authority-snapshot` contract (invariant #8).
