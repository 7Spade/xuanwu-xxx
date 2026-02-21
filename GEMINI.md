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
├── features/     ← 17 vertical feature slices (one per business domain)
└── shared/       ← 5 cross-cutting infrastructure modules
```

### The 3 Top-Level Concerns

| Directory | Role | Count |
|-----------|------|-------|
| `app/` | Next.js App Router — routing & layout composition only | 1 |
| `features/` | Self-contained business domain slices | 17 |
| `shared/` | Cross-cutting infrastructure (types, lib, infra, ai, ui) | 5 |

### Dependency Flow

```
app/  ->  features/{name}/index.ts  ->  shared/*
```

- `app/` imports from `features/*/index.ts` (public API) and `shared/*`
- `features/*` imports from `shared/*` and other features via `index.ts` only
- `shared/*` has zero feature dependencies

### Feature Slice Index

Each slice lives at `src/features/{name}/` and owns everything for its domain:

| Slice | Domain |
|-------|--------|
| `features/auth` | Login, register, reset password |
| `features/account` | Organization CRUD, stats, permissions |
| `features/workspace` | Workspace CRUD, settings, shell |
| `features/members` | Member management |
| `features/teams` | Team management |
| `features/partners` | Partner management |
| `features/schedule` | Schedule, proposals, governance |
| `features/daily` | Daily logs, comments, bookmarks |
| `features/tasks` | Task tree, CRUD |
| `features/audit` | Audit trail, event timeline |
| `features/files` | File upload, management |
| `features/issues` | Issue tracking |
| `features/finance` | Finance plugin |
| `features/qa` | QA plugin |
| `features/document-parser` | AI document parsing |
| `features/acceptance` | Acceptance plugin |
| `features/user-settings` | User profile, preferences |

### Shared Module Index

| Module | Maps From | Contents |
|--------|-----------|----------|
| `shared/types` | `domain-types/` | All TypeScript domain types |
| `shared/lib` | `domain-rules/` + `shared/utils/` | Pure utilities + domain rules |
| `shared/infra` | `firebase/` | Firebase adapters + repositories |
| `shared/ai` | `genkit-flows/` | Genkit AI flows |
| `shared/ui` | `shared/` | shadcn-ui, providers, i18n, constants |

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
