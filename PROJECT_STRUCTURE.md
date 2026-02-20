# Project Structure

> Last updated: 2026-02-20 — reflects current repo after RSC/parallel-routes migration.

---

## Layer Architecture

One-way dependency flow (each layer may only depend on layers below it):

```
app  →  view-modules  →  use-cases  →  react-providers  →  react-hooks
     →  server-commands  →  firebase / genkit-flows / shared  →  domain-rules  →  domain-types
```

Enforced via ESLint `no-restricted-imports` rules in `eslint.config.mts`.

---

## Root

```
/
├── apphosting.yaml
├── components.json          ← shadcn config: aliases → @/shared/shadcn-ui/*
├── eslint.config.mts        ← one-way layer import rules
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
├── backend.json
├── blueprints.md
├── boundaries.md
├── complexity-analysis.md
├── context.md
├── conventions.md
├── events.md
├── GEMINI.md
├── glossary.md
├── interactions.md
├── limits.md
├── over-engineering-analysis.md
├── performance.md
├── plan-app-to-rsc-and-parallel-routes.md   ← Wave migration plan (app→RSC)
├── plan-workspace-architecture-2026.md      ← Workspace parallel-routes plan
├── README.md
├── renamed-file-tree.md
├── rules.md
├── schema.md
├── security.md
└── tools.md
```

---

## src/

### src/domain-types/

Foundation layer — core TypeScript types and interfaces. Zero dependencies.

```
src/domain-types/
├── domain.ts        ← All domain types: Account, Workspace, ScheduleItem, Capability, ...
├── GEMINI.md
└── README.md
```

### src/domain-rules/

Pure business logic — no React, no I/O, no network. Depends only on `domain-types`.

```
src/domain-rules/
├── account/index.ts    ← isOwner, setupOrganizationWithTeam
├── schedule/index.ts   ← canTransitionScheduleStatus
├── task/index.ts       ← buildTaskTree
├── user/index.ts       ← getUserTeamIds
├── workspace/index.ts  ← filterVisibleWorkspaces
├── GEMINI.md
├── index.ts            ← barrel
└── README.md
```

### src/shared/

Globally shared utilities and UI. Import via `@/shared/*`.

```
src/shared/
├── app-providers/
│   ├── auth-provider.tsx       ← Firebase Auth state provider
│   ├── firebase-provider.tsx   ← Firebase SDK instances provider
│   ├── i18n-provider.tsx       ← Internationalization provider
│   └── theme-provider.tsx      ← UI theme provider
├── config/
│   └── README.md
├── constants/
│   ├── routes.ts               ← ROUTES constants (LOGIN, DASHBOARD, ...)
│   └── README.md
├── i18n-types/
│   ├── i18n.schema.ts          ← Full i18n key schema
│   ├── i18n.ts                 ← i18n type helpers
│   └── README.md
├── shadcn-ui/                  ← shadcn/ui components (55 components)
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── page-header.tsx         ← Shared PageHeader: title, description, badge, children
│   ├── sheet.tsx
│   ├── sidebar.tsx             ← Sidebar system (SidebarProvider, useSidebar, ...)
│   ├── skeleton.tsx            ← Use for ALL loading states
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── tooltip.tsx
│   └── ...                    ← (all other shadcn components)
├── utility-hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── utils/
│   ├── format-bytes.ts
│   ├── i18n.ts
│   └── utils.ts               ← cn(), hexToHsl()
├── GEMINI.md
└── README.md
```

### src/styles/

```
src/styles/
└── globals.css    ← Tailwind base + CSS custom properties
```

### src/firebase/

External service I/O — Firebase adapters, facades, and repositories. Depends on `domain-types` and `shared`.

```
src/firebase/
├── analytics/
│   ├── analytics.adapter.ts
│   └── analytics.client.ts
├── auth/
│   ├── auth.adapter.ts
│   └── auth.client.ts
├── firestore/
│   ├── repositories/
│   │   ├── account.repository.ts
│   │   ├── index.ts
│   │   ├── read.repository.ts
│   │   └── workspace.repository.ts
│   ├── firestore.client.ts
│   ├── firestore.converter.ts
│   ├── firestore.facade.ts
│   ├── firestore.read.adapter.ts
│   ├── firestore.utils.ts
│   └── firestore.write.adapter.ts
├── messaging/
│   ├── messaging.adapter.ts
│   └── messaging.client.ts
├── storage/
│   ├── storage.client.ts
│   ├── storage.facade.ts
│   ├── storage.read.adapter.ts
│   └── storage.write.adapter.ts
├── app.client.ts
├── firebase.config.ts
├── GEMINI.md
└── README.md
```

### src/genkit-flows/

Generative AI (Genkit + Gemini). Server-only. Depends on `domain-types`.

```
src/genkit-flows/
├── flows/
│   ├── adapt-ui-color-to-account-context.ts
│   └── extract-invoice-items.ts
├── schemas/
│   └── docu-parse.ts
├── dev.ts
├── GEMINI.md
├── genkit.ts
└── README.md
```

### src/server-commands/

Server boundary — `"use server"` async functions. One subdirectory per domain. Depends on `firebase`, `domain-rules`, `domain-types`, `shared`.

```
src/server-commands/
├── account/index.ts    ← org CRUD, team, partner ops
├── audit/index.ts
├── auth/index.ts       ← register, login, logout
├── bookmark/index.ts   ← toggle, remove bookmark
├── daily/index.ts      ← toggleLike, addDailyLogComment
├── document-parser/index.ts
├── files/index.ts
├── issue/index.ts      ← createIssue, addCommentToIssue
├── members/index.ts
├── schedule/index.ts   ← create/assign/unassign/updateStatus
├── storage/index.ts    ← uploadFile, deleteFile
├── task/index.ts       ← createTask, updateTask, deleteTask
├── user/index.ts       ← updateProfile, createUserAccount
├── workspace/index.ts  ← createWorkspace, mountCapabilities
├── GEMINI.md
├── index.ts            ← barrel re-export of all
└── README.md
```

### src/react-hooks/

Reusable React hooks — data fetching and business logic. Depends on `firebase`, `domain-rules`, `domain-types`, `shared`.

```
src/react-hooks/
├── command-hooks/
│   ├── use-bookmark-commands.ts
│   ├── use-daily-commands.ts
│   └── use-schedule-commands.ts
├── service-hooks/
│   ├── use-daily-upload.ts
│   ├── use-logger.ts
│   └── use-storage.ts
├── state-hooks/
│   ├── use-account-audit.ts
│   ├── use-account-management.ts
│   ├── use-account.ts
│   ├── use-aggregated-logs.ts
│   ├── use-app.ts
│   ├── use-global-schedule.ts
│   ├── use-user.ts
│   ├── use-visible-workspaces.ts
│   ├── use-workspace-audit.ts
│   ├── use-workspace-daily.ts
│   ├── use-workspace-filters.ts
│   └── use-workspace-schedule.ts
├── GEMINI.md
└── README.md
```

### src/react-providers/

Domain React context providers. Depends on `react-hooks`, `firebase`, `domain-types`, `shared`.

```
src/react-providers/
├── account-provider.tsx
├── app-provider.tsx
├── GEMINI.md
├── README.md
├── workspace-event-context.ts   ← WorkspaceEventContext + useWorkspaceEvents()
└── workspace-provider.tsx       ← WorkspaceProvider: wraps WorkspaceEventContext
```

### src/use-cases/

Use-case orchestration — coordinates server-commands and domain logic. Depends on `server-commands`, `react-hooks`, `firebase`, `domain-rules`, `domain-types`, `shared`.

```
src/use-cases/
├── account/index.ts             ← setupOrganizationWithTeam
├── auth/index.ts                ← completeRegistration
├── schedule/index.ts            ← approveScheduleItem, rejectScheduleItem
├── workspace/
│   ├── event-bus/
│   │   ├── workspace-event-bus.ts
│   │   └── workspace-events.ts
│   ├── index.ts
│   └── workspace-actions.ts    ← createWorkspaceWithCapabilities
├── GEMINI.md
├── index.ts                     ← barrel
└── README.md
```

### src/view-modules/

"Smart" UI view components. Compose hooks and use-cases into presentable views. Depends on `use-cases`, `react-providers`, `react-hooks`, `domain-types`, `shared`.

```
src/view-modules/
├── account/
│   └── permission-matrix-view.tsx
├── auth/
│   ├── auth-background.tsx
│   ├── auth-tabs-root.tsx
│   ├── login-form.tsx
│   ├── login-view.tsx
│   ├── register-form.tsx
│   └── reset-password-dialog.tsx
├── dashboard/
│   ├── layout/
│   │   ├── global-search.tsx
│   │   ├── header.tsx
│   │   ├── notification-center.tsx
│   │   └── theme-adapter.tsx
│   ├── sidebar/
│   │   ├── account-create-dialog.tsx
│   │   ├── account-switcher.tsx
│   │   ├── index.tsx              ← DashboardSidebar (smart container)
│   │   ├── nav-main.tsx
│   │   ├── nav-user.tsx
│   │   └── nav-workspaces.tsx
│   ├── account-grid.tsx
│   ├── dashboard-view.tsx
│   ├── permission-tree.tsx
│   ├── stat-cards.tsx
│   └── workspace-list.tsx
├── members/
│   └── members-view.tsx
├── partners/
│   ├── partner-detail-view.tsx
│   └── partners-view.tsx
├── teams/
│   ├── team-detail-view.tsx
│   └── teams-view.tsx
├── user-settings/
│   ├── preferences-card.tsx
│   ├── profile-card.tsx
│   ├── security-card.tsx
│   ├── user-settings-view.tsx
│   └── user-settings.tsx
├── workspaces/
│   ├── create-workspace-dialog.tsx
│   ├── workspace-card.tsx
│   ├── workspace-grid-view.tsx
│   ├── workspace-list-header.tsx
│   ├── workspace-nav-tabs.tsx
│   ├── workspace-settings.tsx
│   ├── workspace-status-bar.tsx
│   ├── workspace-table-view.tsx
│   └── workspaces-view.tsx
├── GEMINI.md
└── README.md
```

---

## src/app/

Pure route tree and RSC boundaries only. No `useState`, `useEffect`, or custom hooks in page/layout files.

### Root

```
src/app/
├── layout.tsx    ← Root providers (Firebase, Auth, i18n, Theme)
└── page.tsx      ← Redirect → /dashboard
```

### src/app/(auth-routes)/

```
(auth-routes)/
├── @modal/
│   ├── (.)reset-password/page.tsx   ← Intercepted reset-password modal
│   └── default.tsx
├── login/page.tsx
├── reset-password/page.tsx
└── layout.tsx
```

### src/app/dashboard/

```
dashboard/
├── @modal/
│   ├── (.)account/new/page.tsx    ← Intercepted account creation modal
│   └── default.tsx
├── account/
│   ├── GEMINI.md
│   ├── audit/page.tsx
│   ├── daily/page.tsx
│   ├── matrix/page.tsx
│   ├── members/page.tsx
│   ├── new/page.tsx
│   ├── partners/
│   │   ├── [id]/page.tsx
│   │   └── page.tsx
│   ├── schedule/page.tsx
│   ├── settings/page.tsx
│   └── teams/
│       ├── [id]/page.tsx
│       └── page.tsx
├── workspaces/
│   ├── GEMINI.md
│   ├── @modal/
│   │   ├── (.)new/page.tsx        ← Intercepted workspace creation modal
│   │   └── default.tsx
│   ├── [id]/
│   │   ├── _event-handlers/
│   │   │   └── workspace-event-handler.tsx
│   │   ├── @modal/                ← PARALLEL SLOT: overlay dialogs
│   │   │   ├── (.)daily-log/[logId]/page.tsx
│   │   │   ├── (.)schedule-proposal/page.tsx
│   │   │   ├── (.)settings/page.tsx
│   │   │   └── default.tsx
│   │   ├── @panel/                ← PARALLEL SLOT: side panels
│   │   │   ├── (.)governance/page.tsx
│   │   │   └── default.tsx
│   │   ├── @plugin-tab/           ← PARALLEL SLOT: active capability tab
│   │   │   ├── acceptance/page.tsx
│   │   │   ├── audit/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── capabilities/page.tsx
│   │   │   ├── daily/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── document-parser/page.tsx
│   │   │   ├── files/page.tsx
│   │   │   ├── finance/page.tsx
│   │   │   ├── issues/page.tsx
│   │   │   ├── members/page.tsx
│   │   │   ├── qa/page.tsx
│   │   │   ├── schedule/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── default.tsx
│   │   │   ├── error.tsx          ← Shared error boundary for @plugin-tab
│   │   │   └── loading.tsx        ← Shared loading fallback for @plugin-tab
│   │   ├── daily-log/[logId]/page.tsx
│   │   ├── governance/page.tsx
│   │   ├── plugins/               ← Capability UI components
│   │   │   ├── acceptance/
│   │   │   ├── audit/
│   │   │   │   └── _plugin-components/
│   │   │   ├── daily/
│   │   │   │   └── _plugin-components/
│   │   │   ├── document-parser/
│   │   │   ├── files/
│   │   │   ├── finance/
│   │   │   ├── issues/
│   │   │   ├── members/
│   │   │   ├── plugin-settings/
│   │   │   ├── qa/
│   │   │   ├── schedule/
│   │   │   │   └── _plugin-components/
│   │   │   ├── tasks/
│   │   │   └── index.ts           ← barrel export
│   │   ├── schedule-proposal/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx             ← WorkspaceProvider + @plugin-tab + @modal + @panel slots
│   │   └── page.tsx
│   ├── new/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── GEMINI.md
├── layout.tsx    ← SidebarProvider + DashboardSidebar + Header
└── page.tsx
```

