# Feature Slice: `account-governance.role`

## Domain

Account role management — defines roles assigned to accounts and triggers CUSTOM_CLAIMS signing/refresh after role changes.

## Responsibilities

- Define and manage account roles (e.g. owner, admin, member)
- Publish role-changed domain events → triggers CUSTOM_CLAIMS refresh
- Provide role-to-permission mapping rules

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `assignRole`, `revokeRole` mutations |
| `_queries.ts` | Role subscription for an account |
| `_components/` | `RoleSelector`, `RoleBadge` |
| `_hooks/` | `useAccountRole` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Account`, `AccountRole`
- `@/shared/infra/firestore/` — Firestore reads/writes

## Architecture Note

`logic-overview.v3.md`: `ACCOUNT_ROLE → CUSTOM_CLAIMS`.
Role changes publish a domain event; custom-claims refresh is handled downstream.
