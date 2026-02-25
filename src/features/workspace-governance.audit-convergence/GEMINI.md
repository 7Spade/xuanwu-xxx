# Feature Slice: `workspace-governance.audit-convergence`

## Domain

Audit convergence bridge baseline.

This slice is a minimal adapter boundary used to align legacy governance-audit
query intent with projection-first audit reads.

## Responsibilities

- Define normalized query contract for audit projection reads
- Keep query limits and filters deterministic
- Provide an explicit migration bridge boundary

## Internal Files

| File | Purpose |
|------|---------|
| `_bridge.ts` | Query normalization helpers for projection-first audit reads |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export { DEFAULT_AUDIT_QUERY_LIMIT, toAuditProjectionQuery } from './_bridge';
export type { AuditConvergenceInput, AuditProjectionQuery } from './_bridge';
```

## Architecture Note

This is a foundational bridge for the long-term convergence direction:
`workspace-governance.audit` UI -> `workspace-core.event-store` + `projection.account-audit`.
