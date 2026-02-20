# `src/use-cases/` — Orchestration & View Bridge Layer

Combines multiple `server-commands` calls into atomic use cases, and provides stable re-export aliases for `view-modules` components.

## Directory structure

```
src/use-cases/
  auth/index.ts          ← completeRegistration (Auth + Firestore profile)
  account/index.ts       ← setupOrganizationWithTeam
  workspace/index.ts     ← createWorkspaceWithCapabilities
  schedule/index.ts      ← approveScheduleItem, rejectScheduleItem
  teams/index.ts         ← re-exports TeamsView, TeamDetailView
  members/index.ts       ← re-exports MembersView
  partners/index.ts      ← re-exports PartnersView, PartnerDetailView
  user-settings/index.ts ← re-exports UserSettingsView
  index.ts               ← namespaced re-exports of all modules
```

## Two types of modules

| Type | Purpose | Allowed imports |
|------|---------|----------------|
| **Orchestration** (`auth`, `account`, `workspace`, `schedule`) | Atomic multi-step async functions. No React. | `@/server-commands/`, `@/domain-rules/`, `@/domain-types/`, `@/lib/` |
| **View bridge** (`teams`, `members`, `partners`, `user-settings`) | Re-export view components for stable app-layer imports. | `@/view-modules/` only |

## What belongs here

- Functions that combine ≥ 2 server-command calls into one operation
- State-transition validation before calling infra (using `@/domain-rules/`)
- Re-exports of view components that give the app layer a domain-named import path

## What does NOT belong here

- Business rules / permission logic → `src/domain-rules/`
- Direct Firebase calls → `src/firebase/` via `src/server-commands/`
- React hooks → `src/react-hooks/`
- UI component implementation → `src/view-modules/`
- App routing / pages → `src/app/`

## Allowed imports

```ts
import ... from '@/server-commands/...'  // ✅ orchestration only
import ... from '@/domain-rules/...'     // ✅ state validation
import ... from '@/domain-types/...'     // ✅ type annotations
import ... from '@/lib/...'              // ✅ pure utilities
import ... from '@/view-modules/...'     // ✅ view-bridge modules only
```

## Forbidden imports

```ts
import ... from 'react'                  // ❌ no React in orchestration
import ... from '@/firebase/...'         // ❌ always go through server-commands
import ... from '@/react-hooks/...'      // ❌
import ... from '@/react-providers/...'  // ❌
import ... from '@/app/...'              // ❌
```

## Who depends on this layer

`src/app/` pages and layouts, `src/react-hooks/` (orchestration functions only).
