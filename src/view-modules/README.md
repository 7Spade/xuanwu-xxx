# `src/view-modules/` — Feature View Components

Composable feature-level UI views assembled by `src/app/` pages and `src/use-cases/` bridges.

## Directory structure

```
src/view-modules/
  auth/                    ← LoginView
  account/                 ← PermissionMatrixView
  audit/                   ← AuditView
  dashboard/               ← DashboardView
  files/                   ← FilesView
  finance/                 ← FinanceView
  members/                 ← MembersView
  partners/                ← PartnersView, PartnerDetailView
  teams/                   ← TeamsView, TeamDetailView
  user-settings/           ← UserSettingsView
  workspace-members/       ← WorkspaceMembersView
```

## What belongs here

- Composite React components that represent a complete feature section
- Components that consume domain context/hooks and render feature UI
- Layout and interaction logic scoped to a single domain

## What does NOT belong here

- Business rules / permission checks → `src/domain-rules/`
- Server actions / mutations → `src/server-commands/`
- Global state management → `src/react-providers/`
- Next.js routing files (`page.tsx`, `layout.tsx`) → `src/app/`
- Primitive UI atoms (Button, Dialog) → `src/shared/shadcn-ui/`

## Naming convention

- File: `{domain}-view.tsx` (main view), `{domain}-{subfeature}.tsx` (parts)
- Export: named export `export function {Domain}View` — **no default exports**

## Allowed imports

```ts
import ... from '@/shared/shadcn-ui/...'      // ✅ primitive components
import ... from '@/shared/utility-hooks/...'  // ✅ use-mobile, use-toast
import ... from '@/react-hooks/...'           // ✅ domain hooks
import ... from '@/react-providers/...'       // ✅ context consumers
import ... from '@/server-commands/...'       // ✅ server actions
import ... from '@/domain-types/...'          // ✅ type definitions
import ... from '@/lib/...'                   // ✅ pure utilities
```

## Forbidden imports

```ts
import ... from '@/app/...'         // ❌ never import from app layer
import ... from '@/use-cases/...'   // ❌ use-cases depend on view-modules, not vice versa
import ... from '@/firebase/...'    // ❌ always go through hooks or server-commands
```

## Who depends on this layer

`src/use-cases/` (re-exports views for stable app-layer aliases).  
`src/app/` (direct imports for route-specific plugin-tab pages).
