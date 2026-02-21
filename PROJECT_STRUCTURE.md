# Project Structure

> Last updated: 2026-02-21 — Vertical Slice Architecture (VSA) target state.
>
> **Migration status**: Existing code resides in legacy layers (`domain-types/`, `firebase/`, etc.).
> New features must be built in `src/features/`. Incremental migration plan in
> `docs/vertical-slice-architecture.md` § 7.

---

## Architecture Overview

Vertical Slice Architecture — **3 categories, 22 modules**.

```
src/
├── app/          ← Next.js routing only (1)
├── features/     ← Business domain slices (17)
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
├── eslint.config.mts        ← import boundary rules
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

Architecture documentation, migration plans, and design decisions:

```
docs/
├── architecture.md
├── vertical-slice-architecture.md   ← VSA design: slices, structure tree, rules
├── boundaries.md
├── conventions.md
├── schema.md
├── security.md
├── events.md
├── glossary.md
└── ...
```

---

## src/app/

Pure Next.js routing. Only `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `default.tsx`.
No business logic. All imports come from `@/features/*/` (public API) or `@/shared/*`.

```
src/app/
├── layout.tsx    ← Root providers
├── page.tsx      ← Redirect -> /dashboard
├── (auth-routes)/
│   ├── login/page.tsx
│   ├── reset-password/page.tsx
│   ├── @modal/(.)reset-password/page.tsx
│   └── layout.tsx
└── dashboard/
    ├── layout.tsx
    ├── page.tsx
    ├── @modal/
    │   ├── (.)account/new/page.tsx
    │   └── default.tsx
    ├── @header/default.tsx
    ├── @sidebar/default.tsx
    ├── account/
    │   ├── schedule/page.tsx
    │   ├── members/page.tsx
    │   ├── teams/[id]/page.tsx
    │   ├── partners/[id]/page.tsx
    │   ├── settings/page.tsx
    │   ├── audit/page.tsx
    │   ├── daily/page.tsx
    │   ├── matrix/page.tsx
    │   └── new/page.tsx
    └── workspaces/
        ├── layout.tsx
        ├── page.tsx
        ├── new/page.tsx
        ├── @modal/(.)new/page.tsx
        └── [id]/
            ├── layout.tsx
            ├── page.tsx
            ├── @plugin-tab/
            │   ├── schedule/page.tsx
            │   ├── daily/page.tsx
            │   ├── tasks/page.tsx
            │   ├── audit/page.tsx
            │   ├── members/page.tsx
            │   ├── files/page.tsx
            │   ├── issues/page.tsx
            │   ├── finance/page.tsx
            │   ├── qa/page.tsx
            │   ├── acceptance/page.tsx
            │   ├── document-parser/page.tsx
            │   ├── capabilities/page.tsx
            │   ├── default.tsx
            │   ├── error.tsx
            │   └── loading.tsx
            ├── @modal/
            │   ├── (.)schedule-proposal/page.tsx
            │   ├── (.)daily-log/[logId]/page.tsx
            │   ├── (.)settings/page.tsx
            │   └── default.tsx
            ├── @panel/
            │   ├── (.)governance/page.tsx
            │   └── default.tsx
            ├── governance/page.tsx
            ├── schedule-proposal/page.tsx
            ├── settings/page.tsx
            └── daily-log/[logId]/page.tsx
```

---

## src/features/

17 vertical feature slices. Each slice is self-contained — owns types, actions, queries, hooks,
and components for its business domain.

```
src/features/
├── auth/           ← Login, register, reset password
├── account/        ← Organization CRUD, stats, permissions
├── workspace/      ← Workspace CRUD, settings, dashboard shell
├── members/        ← Member management (account + workspace)
├── teams/          ← Team management
├── partners/       ← Partner management
├── schedule/       ← Schedule items, proposals, governance
├── daily/          ← Daily logs, comments, bookmarks, likes
├── tasks/          ← Task tree, CRUD
├── audit/          ← Audit trail, event timeline
├── files/          ← File upload, management
├── issues/         ← Issue tracking, comments
├── finance/        ← Finance workspace plugin
├── qa/             ← QA workspace plugin
├── document-parser/← AI document parsing (invoice extraction)
├── acceptance/     ← Acceptance workspace plugin
└── user-settings/  ← User profile, preferences, security
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

---

## src/shared/

5 cross-cutting infrastructure modules. No feature logic here.

```
src/shared/
├── types/       ← Global domain types (was: domain-types/)
├── lib/         ← Pure utils + domain rules (was: domain-rules/ + shared/utils/)
├── infra/       ← Firebase adapters + repositories (was: firebase/)
├── ai/          ← Genkit AI flows (was: genkit-flows/)
└── ui/          ← shadcn-ui, app-providers, i18n, constants (was: shared/)
```

---

## Legacy Layers (Migration In Progress)

The following directories exist from the previous horizontal-layer architecture.
They will be migrated into `features/` and `shared/` incrementally:

```
src/
├── domain-types/    → shared/types/
├── domain-rules/    → shared/lib/
├── firebase/        → shared/infra/
├── genkit-flows/    → shared/ai/
├── server-commands/ → features/{name}/_actions.ts
├── react-hooks/     → features/{name}/_hooks/
├── react-providers/ → features/{name}/_hooks/ or shared/ui/
├── use-cases/       → features/{name}/ (inline into hooks or actions)
└── view-modules/    → features/{name}/_components/
```
