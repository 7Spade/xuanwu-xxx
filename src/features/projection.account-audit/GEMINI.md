# Feature Slice: `projection.account-audit`

## Domain

Account audit projection — audit trail of account-related events for compliance and observability purposes.

## Responsibilities

- Maintain an append-only audit projection of account domain events
- Support account-level audit queries (who did what, when)
- Feed observability and compliance dashboards

## Internal Files (Projection Slice Specialization)

| File / Dir | Purpose |
|-----------|---------|
| `_projector.ts` | Event → audit record append |
| `_read-model.ts` | Audit record Firestore schema |
| `_queries.ts` | Audit trail queries |
| `index.ts` | Public query hooks / types |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `AuditRecord`, `Account`
- `@/shared/infra/firestore/` — append-only audit collection

## Architecture Note

`logic-overview.v3.md`: `EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_AUDIT`.
Audit projections are append-only — no delete or update operations.
