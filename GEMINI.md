# Project: Architecture Principles

## Core Principle

This project follows **Occam's Razor**:

> Do not introduce more complexity than is strictly necessary.

All design, architecture, and implementation decisions must favor the **simplest possible solution that fully satisfies the requirements**.

## Vertical Slice Architecture — AI 開發零認知

The project uses **Vertical Slice Architecture (VSA)**. Code is organized by **business domain** (vertical slices), not by technical layer (horizontal layers).

**目標：實作任何功能只需讀一個資料夾。**

```
src/
├── app/          ← Next.js routing ONLY (pure composition)
├── features/     ← 42 vertical feature slices (one per business domain)
└── shared/       ← 5 cross-cutting infrastructure modules
```

### The 3 Top-Level Concerns

| Directory | Role | Count |
|-----------|------|-------|
| `app/` | Next.js App Router — routing & layout composition only | 1 |
| `features/` | Self-contained business domain slices | 42 |
| `shared/` | Cross-cutting infrastructure (types, lib, infra, ai, ui) | 5 |

### Dependency Flow

```
app/  ->  features/{name}/index.ts  ->  shared/*
```

- `app/` imports from `features/*/index.ts` (public API) and `shared/*`
- `features/*` imports from `shared/*` and other features via `index.ts` only
- `shared/*` has zero feature dependencies

### Feature Slice Index

Each slice lives at `src/features/{name}/` and owns everything for its domain.
Workspace slices use dot-namespace: `workspace-core.*` for infrastructure, `workspace-business.*` for day-to-day operations, `workspace-governance.*` for organizational governance.
Account slices use dot-namespace: `account-user.*` for personal user features, `account-organization.*` for org-level features.

| Slice | Domain |
|-------|--------|
| `features/identity-account.auth` | Login, register, reset password |
| `features/account` | Organization CRUD, stats, permissions |
| `features/account-governance.role` | Account role management → CUSTOM_CLAIMS signing |
| `features/account-governance.policy` | Account policy management |
| `features/account-governance.notification-router` | Notification router (FCM Layer 2 — by TargetAccountID) |
| `features/account-user.profile` | User profile, preferences, security |
| `features/account-user.wallet` | User personal wallet, balance (stub) |
| `features/account-user.notification` | Personal push notification (FCM Layer 3) |
| `features/account-organization.core` | Organization aggregate entity + binding |
| `features/account-organization.event-bus` | Organization event bus |
| `features/account-organization.member` | Org-level member invite/remove |
| `features/account-organization.team` | Team management (internal group view) |
| `features/account-organization.partner` | Partner management (external group view) |
| `features/account-organization.policy` | Organization policy management |
| `features/account-organization.skill-tag` | Skill tag pool (flat resource pool) |
| `features/account-organization.schedule` | HR scheduling · ScheduleAssigned event (FCM Layer 1) |
| `features/workspace-application` | Command handler · Scope Guard · Policy Engine · Transaction Runner · Outbox |
| `features/workspace-core` | Workspace CRUD, shell, provider, list |
| `features/workspace-core.event-bus` | Intra-workspace event bus |
| `features/workspace-core.event-store` | Event store (replay/audit only) |
| `features/workspace-governance.members` | Workspace member access & roles |
| `features/workspace-governance.role` | Role management (split from members) |
| `features/workspace-governance.teams` | Stub — team views migrated to `account-organization.team` |
| `features/workspace-governance.partners` | Stub — partner views migrated to `account-organization.partner` |
| `features/workspace-governance.schedule` | Stub — implementation migrated to `workspace-business.schedule` |
| `features/workspace-governance.audit` | Audit trail, event timeline |
| `features/workspace-business.daily` | Daily logs, comments, bookmarks |
| `features/workspace-business.schedule` | Schedule items, proposals, decisions (migrated from workspace-governance.schedule) |
| `features/workspace-business.files` | File upload, management |
| `features/workspace-business.document-parser` | AI document parsing |
| `features/workspace-business.tasks` | Task tree, CRUD |
| `features/workspace-business.quality-assurance` | QA plugin |
| `features/workspace-business.acceptance` | Acceptance plugin |
| `features/workspace-business.finance` | Finance plugin |
| `features/workspace-business.issues` | Issue tracking |
| `features/projection.workspace-view` | Workspace read model (workspace projection view) |
| `features/projection.workspace-scope-guard` | Scope Guard dedicated read model |
| `features/projection.account-view` | Account read model · authority snapshot contract |
| `features/projection.account-audit` | Account audit projection |
| `features/projection.account-schedule` | Account schedule projection (filter available accounts) |
| `features/projection.organization-view` | Organization read model |
| `features/projection.registry` | Event stream offset · read model version table |

### Shared Module Index

| Module | Contents |
|--------|----------|
| `shared/types` | All TypeScript domain types |
| `shared/lib` | Pure utilities + domain rules |
| `shared/infra` | Firebase adapters + repositories |
| `shared/ai` | Genkit AI flows |
| `shared/ui` | shadcn-ui, app-providers, i18n, constants |

> **Full design doc**: `docs/vertical-slice-architecture.md`

## Slice Internal Structure

Every `features/{name}/` slice follows this standard layout:

```
features/{name}/
├── GEMINI.md        ← AI instructions for this slice (required)
├── _actions.ts      ← "use server" mutations (optional)
├── _queries.ts      ← Firestore reads / onSnapshot (optional)
├── _types.ts        ← Feature-specific type extensions (optional)
├── _hooks/          ← React hooks (optional)
├── _components/     ← UI components (optional)
└── index.ts         ← Public API — only symbols exported to other slices (required)
```

The `_` prefix marks files as **slice-private**. Other slices must only import through `index.ts`.

## Review Checklist

Before adding code, ask:

*   Can this be done with fewer files?
*   Can this be done without a new abstraction?
*   Is this solving a real problem now?
*   Does it belong in the correct slice?
*   Am I importing only through `index.ts` (not private `_` paths)?

If the answer favors the simpler path, take it.

## Final Note

Complexity is a liability. Simplicity is a feature.
