# Feature Slice: `account`

## Domain

Multi-account management shell — AccountProvider (realtime data context), AccountGrid, and StatCards. Pure presentation and context; all write operations live in their dedicated sub-slices.

## Responsibilities

- Provide `AccountProvider` + `useAccount` hook for real-time account-level data (workspaces, dailyLogs, auditLogs, invites, schedule_items)
- Display account grid (`AccountGrid`) — list of organization accounts
- Display stat cards (`StatCards`) — workspace consistency, activity pulse, capability load

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_components/account-provider.tsx` | `AccountProvider` + `AccountContext` — real-time Firestore subscriptions |
| `_components/account-grid.tsx` | `AccountGrid` component |
| `_components/stat-cards.tsx` | `StatCards` component |
| `_hooks/use-account.ts` | `useAccount` — context consumer hook |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export { AccountProvider, AccountContext } from './_components/account-provider'
export { AccountGrid } from './_components/account-grid'
export { StatCards } from './_components/stat-cards'
export { useAccount } from './_hooks/use-account'
```

## Slice Boundaries (what moved out)

| Capability | Now lives in |
|-----------|-------------|
| `AccountNewForm` (create org UI) | `account-organization.core` |
| `useOrgManagement` (org CRUD) | `account-organization.core` |
| `useMemberManagement` (recruit/dismiss) | `account-organization.member` |
| `useTeamManagement` (team ops) | `account-organization.team` |
| `usePartnerManagement` (partner ops) | `account-organization.partner` |
| `PermissionMatrixView`, `PermissionTree` | `account-governance.role` |

## Allowed Imports

```ts
import ... from "@/shared/types";   // Account, Organization types
import ... from "@/shared/infra";   // Firestore utils
import ... from "@/features/workspace-core";  // useApp
```

## Who Uses This Slice?

- `app/(shell)/layout.tsx` — wraps shell with `AccountProvider`
- `features/workspace-core/_components/dashboard-view.tsx` — `StatCards`, `AccountGrid`
- `features/workspace-governance.*` — `useAccount` for account state
- `features/workspace-business.*` — `useAccount` for dailyLogs, scheduleItems
