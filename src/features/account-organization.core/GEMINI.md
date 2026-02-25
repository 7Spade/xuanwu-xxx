# Feature Slice: `account-organization.core`

## Domain

Organization aggregate entity — its lifecycle (create, update, delete), the UI for creating/listing organizations, and the binding between organization accounts and organization entities.

## Responsibilities

- Organization aggregate lifecycle (create, update, delete)
- Display organization list (`AccountGrid`) and create form (`AccountNewForm`)
- `setupOrganizationWithTeam` — bootstraps a new org with an initial team
- Publish organization domain events to `account-organization.event-bus`

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createOrganization`, `updateOrganizationSettings`, `deleteOrganization`, `setupOrganizationWithTeam` |
| `_components/account-new-form.tsx` | Form UI for creating a new organization |
| `_components/account-grid.tsx` | Grid UI listing organization accounts |
| `_hooks/use-organization-management.ts` | `useOrganizationManagement` — hook wrapping org CRUD actions |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export { AccountNewForm } from './_components/account-new-form'
export { AccountGrid } from './_components/account-grid'
export { useOrganizationManagement } from './_hooks/use-organization-management'
export { setupOrganizationWithTeam } from './_actions'
```

## Dependencies

- `@/shared/types` — `Account`, `ThemeConfig`
- `@/shared/infra/firestore/firestore.facade` — Firestore writes
- `@/shared/app-providers/app-context` — `useApp` for active account context (Subject Center must not depend on workspace-core)

## Architecture Note

`logic-overview.v3.md`: `ORGANIZATION_ACCOUNT_BINDING → ORGANIZATION_ENTITY → ORGANIZATION_EVENT_BUS`.
This slice owns the organization aggregate; all mutations must go through the aggregate actions.
