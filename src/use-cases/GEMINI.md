# Use Cases Layer (`src/use-cases/`)

## 1. Responsibility

This directory serves two related but distinct purposes:

### A. Multi-step Orchestration Use Cases (pure async, no React)

Combine multiple `server-commands` calls into one atomic use case. Zero React dependency.

| Module | Logic file | Key exports |
|--------|-----------|-------------|
| `auth/` | `auth.use-cases.ts` | `completeRegistration` — registers Firebase Auth + creates Firestore profile |
| `account/` | `account.use-cases.ts` | `setupOrganizationWithTeam` — creates org + provisions initial team |
| `workspace/` | `workspace.use-cases.ts` | `createWorkspaceWithCapabilities` — creates workspace + mounts capabilities |
| `schedule/` | `schedule.use-cases.ts` | `approveScheduleItem`, `rejectScheduleItem` — validates state transitions before persisting |

Each module also has a thin `index.ts` that re-exports from the named file (e.g., `export * from "./auth.use-cases"`).

### B. View Component Re-exports

Re-export composable view components from `src/view-modules/` so `app/` has a single stable import surface per domain.

| Module | What it re-exports |
|--------|--------------------|
| `teams/` | `TeamsView`, `TeamDetailView` |
| `members/` | `MembersView` |
| `partners/` | `PartnersView`, `PartnerDetailView` |
| `user-settings/` | `UserSettingsView` |

## 2. Input / Output contracts

| Function | Input | Output | Throws? |
|----------|-------|--------|---------|
| `completeRegistration(email, password, name)` | 3 strings | `Promise<void>` | Yes (Firebase errors) |
| `setupOrganizationWithTeam(orgName, owner, teamName, teamType)` | strings + Account | `Promise<string>` (orgId) | Yes |
| `createWorkspaceWithCapabilities(name, account, capabilities)` | strings + Account + Capability[] | `Promise<string>` (workspaceId) | Yes |
| `approveScheduleItem(item)` | `ScheduleItem` | `Promise<void>` | Yes (invalid transition) |
| `rejectScheduleItem(item)` | `ScheduleItem` | `Promise<void>` | Yes (invalid transition) |

## 3. Side effects

**All orchestration use cases produce Firebase side effects** via the server-commands they call.

- `completeRegistration` → Firebase Auth write + Firestore write
- `setupOrganizationWithTeam` → 2× Firestore writes
- `createWorkspaceWithCapabilities` → 1–2× Firestore writes
- `approveScheduleItem` / `rejectScheduleItem` → 1× Firestore write

## 4. Dependency rules

### Allowed
- `@/server-commands/` — for orchestration functions
- `@/domain-rules/` — for business rule validation before calling infra
- `@/domain-types/` — domain interfaces
- `@/lib/` — pure utilities
- `@/view-modules/` — **only** for re-exporting view components (type B sub-dirs)

### Forbidden
- `react` — orchestration use cases must be React-free
- `@/react-hooks/` — no hook imports
- `@/react-providers/` — no context reads
- `@/firebase/` — always go through `server-commands`
- `@/app/` — no upward dependency

## 5. Who depends on this layer?

`src/app/` pages and layouts, `src/react-hooks/` (for orchestration functions), `src/view-modules/` (for view bridges).

## 6. Rule of Thumb

- If the logic combines **≥ 2 server-command calls**, it belongs here as an orchestration function.
- If the module only re-exports a view, `index.ts` contains nothing except `export * from "@/view-modules/..."`.
- Orchestration modules must have **zero React imports**; view-bridge modules may **only** import from `@/view-modules/`.
