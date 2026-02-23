# Feature Slice: `account-organization.core`

## Domain

Organization core — the organization aggregate entity, its settings, and the binding between organization accounts and organization entities.

## Responsibilities

- Organization aggregate lifecycle (create, update, archive)
- `organization-account.binding` — links an organization account to an organization entity
- `organization-account.settings` — stores organization-level configuration
- Publish organization domain events to `account-organization.event-bus`

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_aggregate.ts` | Organization aggregate root |
| `_actions.ts` | `createOrganization`, `updateOrgSettings`, `bindAccount` |
| `_queries.ts` | Organization details subscription |
| `_components/` | `OrgSettingsForm`, `OrgCard` |
| `_hooks/` | `useOrganization` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Organization`, `OrganizationAccount`
- `@/shared/infra/firestore/` — Firestore reads/writes

## Architecture Note

`logic-overview.v3.md`: `ORGANIZATION_ACCOUNT_BINDING → ORGANIZATION_ENTITY → ORGANIZATION_EVENT_BUS`.
This slice owns the organization aggregate; all mutations must go through the aggregate root.
