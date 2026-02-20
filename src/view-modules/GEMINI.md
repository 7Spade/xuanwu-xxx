# Project: View Modules Layer (`src/view-modules/`)

## 1. Responsibility

This directory contains **feature-level composable view components** — the building blocks assembled by the `app/` layer into pages and layouts. Each sub-directory owns one domain's visual presentation.

A **view** is a composite React component (usually a Client Component) that:
- Reads from context/hooks rather than accepting all data as props.
- Contains the layout and interaction logic for an entire feature section.
- Does **not** contain routing logic or Next.js-specific page structure.

## 2. Directory Map

| Module | Primary exports |
|--------|----------------|
| `auth/` | `LoginView` |
| `account/` | `PermissionMatrixView` |
| `audit/` | `AuditView` |
| `dashboard/` | `DashboardView` |
| `files/` | `FilesView` |
| `finance/` | `FinanceView` |
| `members/` | `MembersView` |
| `partners/` | `PartnersView`, `PartnerDetailView` |
| `teams/` | `TeamsView`, `TeamDetailView` |
| `user-settings/` | `UserSettingsView` |
| `workspace-members/` | `WorkspaceMembersView` |

## 3. Dependency Rules

View modules sit **below** the `app/` layer and **above** hooks, context, and infra.

### Allowed Imports:
- `@/shared/shadcn-ui/` — primitive UI components
- `@/shared/utility-hooks/` — framework-level UI hooks
- `@/react-hooks/` — domain hooks (state, service, command)
- `@/react-providers/` — domain context consumers
- `@/server-commands/` — server actions for mutations
- `@/domain-types/` — domain type definitions
- `@/lib/` — pure utilities

### Disallowed Imports:
- `import ... from '@/app/...'` — **never** import from the app layer (one-way dep rule)
- `import ... from '@/use-cases/...'` — view-modules are imported **by** use-cases, not the reverse
- `import ... from '@/firebase/...'` — go through hooks or server-commands

## 4. Who Depends on This Layer?

`src/use-cases/` (view-bridge re-exports) and `src/app/` (directly for plugin-tab pages and route-specific components).

## 5. Naming Conventions

- File names: `{domain}-view.tsx` for the top-level view, optional `{domain}-{subfeature}.tsx` for parts.
- Component names: `PascalCase` matching the feature (e.g., `TeamsView`, `PartnerDetailView`).
- Each view component must be a **named export**, not a default export.
