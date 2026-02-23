# Feature Slice: `account`

## Domain

Organization (Account) management — CRUD, statistics, permission matrix, new org creation.

## Responsibilities

- Create / update / delete organization
- Setup organization with initial team
- Display account grid and stat cards
- Permission matrix view
- Account creation form (intercepted modal)

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createOrg`, `updateOrg`, `deleteOrg`, `setupOrganizationWithTeam` |
| `_queries.ts` | Firestore listeners for account data |
| `_hooks/` | `useAccountManagement`, `useAccountAudit` |
| `_components/` | `AccountGrid`, `AccountNewForm`, `PermissionMatrixView`, `PermissionTree`, `StatCards` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { AccountGrid } from "./_components/account-grid";
export { AccountNewForm } from "./_components/account-new-form";
export { PermissionMatrixView } from "./_components/permission-matrix-view";
export { StatCards } from "./_components/stat-cards";
```

## Allowed Imports

```ts
import ... from "@/shared/types";   // Account, Organization types
import ... from "@/shared/lib";     // isOwner, setupOrganizationWithTeam rules
import ... from "@/shared/infra";   // Firestore repositories
import ... from "@/shared/ui/...";  // shadcn-ui components
```

## Who Uses This Slice?

- `app/dashboard/@modal/(.)account/new/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/account/matrix/page.tsx`
