# Project: Use Cases Layer (`src/use-cases/`)

## 1. Responsibility

This directory serves two related but distinct purposes:

### A. Multi-step Orchestration Use Cases (pure async, no React)
Some sub-directories contain **async orchestration functions** that combine multiple `server-commands` calls into a single atomic use case. These functions have no React dependency and are callable from hooks, context providers, or Server Actions.

| Module | Key exports |
|--------|-------------|
| `auth/` | `completeRegistration` — registers Firebase Auth + creates Firestore profile |
| `account/` | `setupOrganizationWithTeam` — creates org + provisions initial team |
| `workspace/` | `createWorkspaceWithCapabilities` — creates workspace + mounts capabilities |
| `schedule/` | `approveScheduleItem`, `rejectScheduleItem` — validates state transitions before persisting |

### B. View Component Re-exports
Other sub-directories act as **view bridges**: they re-export composable view components from `src/view-modules/` so the `app/` layer has a single, stable import surface per domain.

| Module | What it re-exports |
|--------|--------------------|
| `teams/` | `TeamsView`, `TeamDetailView` |
| `members/` | `MembersView` |
| `partners/` | `PartnersView`, `PartnerDetailView` |
| `user-settings/` | `UserSettingsView` |

## 2. Dependency Rules

### Allowed Imports:
- `@/server-commands/` — for orchestration functions
- `@/domain-rules/` — for business rule validation before calling infra
- `@/domain-types/` — domain interfaces
- `@/lib/` — pure utilities
- `@/view-modules/` — **only** for re-exporting view components (type B sub-dirs)

### Disallowed Imports:
- `import ... from 'react'` — orchestration use cases must be React-free
- `import ... from '@/react-hooks/...'`
- `import ... from '@/react-providers/...'`
- `import ... from '@/firebase/...'` — always go through `server-commands`
- `import ... from '@/app/...'`

## 3. Who Depends on This Layer?

`src/app/` — pages and layouts import orchestration functions and view components exclusively through this layer. `src/react-hooks/` may also import orchestration functions.

## 4. Rule of Thumb

- If the logic combines ≥ 2 server-command calls, it belongs here as an orchestration function.
- If the module only re-exports a view, the `index.ts` must contain nothing except `export { ... } from "@/view-modules/..."`.
- Orchestration modules must have zero React imports; view-bridge modules may only import from `@/view-modules/`.
