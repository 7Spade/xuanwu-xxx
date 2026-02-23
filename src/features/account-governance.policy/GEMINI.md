# Feature Slice: `account-governance.policy`

## Domain

Account policy management — defines access control policies and enforces them across the account governance layer.

## Responsibilities

- Define and manage account-level policies (e.g. access control rules, compliance settings)
- Publish policy-changed domain events → triggers CUSTOM_CLAIMS refresh
- Policy validation for account operations

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createPolicy`, `updatePolicy`, `deletePolicy` |
| `_queries.ts` | Policy subscription for an account |
| `_components/` | `PolicyList`, `PolicyForm` |
| `_hooks/` | `useAccountPolicy` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Account`, `AccountPolicy`
- `@/shared/infra/firestore/` — Firestore reads/writes

## Architecture Note

`logic-overview.v3.md`: `ACCOUNT_POLICY → CUSTOM_CLAIMS`.
Policy changes publish a domain event; custom-claims refresh is handled downstream.
