# Project Structure

> Last updated: 2026-02-21 — Vertical Slice Architecture (VSA) complete.

---

## Architecture Overview

Vertical Slice Architecture — **3 categories, 26 modules**.

```
src/
├── app/          ← Next.js routing only (1)
├── features/     ← Business domain slices (20)
└── shared/       ← Cross-cutting infrastructure (5)
```

Dependency flow (one-way, left to right):

```
app  ->  features/{name}/index.ts  ->  shared/*
```

Full design: `docs/vertical-slice-architecture.md`

---

## Root

```
/
├── apphosting.yaml
├── components.json          ← shadcn config: aliases -> @/shared/ui/*
├── eslint.config.mts        ← VSA import boundary rules
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── functions/               ← Firebase Cloud Functions
│   └── src/index.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── PROJECT_STRUCTURE.md     ← this file
├── public/
│   └── localized-files/     ← en.json, zh-TW.json
├── storage.rules
├── tailwind.config.ts
└── tsconfig.json
```

---

## docs/

Architecture documentation, design decisions, and system contracts:

```
docs/
├── vertical-slice-architecture.md   ← VSA design: slices, structure tree, rules
├── architecture.md
├── boundaries.md
├── conventions.md
├── context.md
├── events.md
├── schema.md
├── security.md
├── glossary.md
└── ...
```

---

## src/app/

Pure Next.js App Router routing. Only `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `default.tsx`.
No business logic. All imports come from `@/features/*/index.ts` (public API) or `@/shared/*`.

### Route Groups

| Group | Role | URL |
|---|---|---|
| `(public)` | Unauthenticated pages | `/login`, `/reset-password` |
| `(shell)` | Visual frame (SidebarProvider + @sidebar + @modal) | transparent |
| `(account)` | AccountProvider — shared by dashboard + workspaces | transparent |
| `(dashboard)` | Org/account management pages | `/dashboard/**` |
| `(workspaces)` | Workspace module (list + detail) | `/workspaces/**` |

```
src/app/
├── layout.tsx                              ← root providers (Firebase, Auth, i18n)
├── (public)/                               ← /login, /reset-password
│   ├── layout.tsx
│   ├── @modal/(.)reset-password/page.tsx
│   ├── login/page.tsx
│   └── reset-password/page.tsx
└── (shell)/                                ← visual frame
    ├── layout.tsx                          ← SidebarProvider + @sidebar + @modal
    ├── @sidebar/default.tsx
    ├── @modal/default.tsx
    ├── page.tsx                            ← / redirect
    └── (account)/                          ← AccountProvider (shared context)
        ├── layout.tsx
        ├── (dashboard)/                    ← /dashboard/**
        │   └── dashboard/
        │       ├── layout.tsx              ← SidebarInset + @header + @modal
        │       ├── page.tsx                ← /dashboard
        │       ├── @header/default.tsx
        │       ├── @modal/
        │       │   ├── (.)account/new/page.tsx
        │       │   └── default.tsx
        │       └── account/
        │           ├── audit/page.tsx
        │           ├── daily/page.tsx
        │           ├── matrix/page.tsx
        │           ├── members/page.tsx
        │           ├── new/page.tsx
        │           ├── partners/[id]/page.tsx
        │           ├── partners/page.tsx
        │           ├── schedule/page.tsx
        │           ├── settings/page.tsx
        │           ├── teams/[id]/page.tsx
        │           └── teams/page.tsx
        └── (workspaces)/                   ← /workspaces/**
            └── workspaces/
                ├── layout.tsx              ← SidebarInset + @modal
                ├── page.tsx                ← /workspaces
                ├── new/page.tsx
                ├── @modal/
                │   ├── (.)new/page.tsx
                │   └── default.tsx
                └── [id]/                   ← /workspaces/[id]
                    ├── layout.tsx          ← WorkspaceProvider
                    ├── page.tsx
                    ├── @modal/
                    │   ├── (.)daily-log/[logId]/page.tsx
                    │   ├── (.)schedule-proposal/page.tsx
                    │   ├── (.)settings/page.tsx
                    │   └── default.tsx
                    ├── @panel/
                    │   ├── (.)governance/page.tsx
                    │   └── default.tsx
                    ├── @plugin-tab/
                    │   ├── acceptance/page.tsx
                    │   ├── audit/page.tsx
                    │   ├── capabilities/page.tsx
                    │   ├── daily/page.tsx
                    │   ├── document-parser/page.tsx
                    │   ├── files/page.tsx
                    │   ├── finance/page.tsx
                    │   ├── issues/page.tsx
                    │   ├── members/page.tsx
                    │   ├── qa/page.tsx
                    │   ├── schedule/page.tsx
                    │   ├── tasks/page.tsx
                    │   ├── default.tsx
                    │   ├── error.tsx
                    │   └── loading.tsx
                    ├── daily-log/[logId]/page.tsx
                    ├── governance/page.tsx
                    ├── schedule-proposal/page.tsx
                    └── settings/page.tsx
```

---

## src/features/

20 vertical feature slices. Each slice is self-contained — owns types, actions, queries, hooks,
and components for its business domain.

Workspace slices follow dot-namespace convention:
- `workspace-core.*` — infrastructure (CRUD, shell, event bus)
- `workspace-business.*` — business plugins
- `workspace-governance.*` — governance workflows

```
src/features/
├── auth/                            ← Login, register, reset password
├── account/                         ← Organization CRUD, stats, permissions
├── user-settings/                   ← User profile, preferences, security
├── workspace-core/                  ← Workspace CRUD, shell, provider, list
├── workspace-core.event-bus/        ← Intra-workspace event bus
├── workspace-business.members/      ← Member management (workspace-level)
├── workspace-business.teams/        ← Team management
├── workspace-business.partners/     ← Partner management
├── workspace-business.daily/        ← Daily logs, comments, bookmarks
├── workspace-business.tasks/        ← Task tree, CRUD
├── workspace-business.audit/        ← Audit trail, event timeline
├── workspace-business.files/        ← File upload, management
├── workspace-business.issues/       ← Issue tracking
├── workspace-business.finance/      ← Finance workspace plugin
├── workspace-business.qa/           ← QA workspace plugin
├── workspace-business.document-parser/ ← AI document parsing
├── workspace-business.acceptance/   ← Acceptance workspace plugin
└── workspace-governance.schedule/   ← Schedule, proposals, governance
```

Each slice follows the standard layout:

```
features/{name}/
├── GEMINI.md        ← AI instructions (required)
├── _actions.ts      ← "use server" mutations
├── _queries.ts      ← Firestore reads / onSnapshot
├── _types.ts        ← Feature-specific types
├── _hooks/          ← React hooks
├── _components/     ← UI components
└── index.ts         ← Public API (required)
```

The `_` prefix marks files as **slice-private**. Other slices must only import through `index.ts`.

---

## src/shared/

5 cross-cutting infrastructure modules. No feature logic here.

```
src/shared/
├── types/       ← Global domain types
├── lib/         ← Pure utils + domain rules
├── infra/       ← Firebase adapters + repositories
├── ai/          ← Genkit AI flows
└── ui/          ← shadcn-ui, app-providers, i18n, constants
```
