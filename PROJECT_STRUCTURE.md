# Project Structure

> Last updated: 2026-02-20 — reflects current repo after RSC/parallel-routes migration (Wave 1 complete).

---

## Layer Architecture

One-way dependency flow (each layer may only depend on layers below it):

```
app  →  features  →  actions  →  entities  →  infra  →  types
           ↓
        shared/ui  (shadcn components, import via @/shared/ui/*)
        context/   (domain providers: workspace, account, app)
        hooks/     (reusable React hooks)
```

---

## Root

```
/
├── apphosting.yaml
├── components.json          ← shadcn config: ui→@/shared/ui, utils→@/shared/utils/utils
├── eslint.config.mts
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

Migration plans and architecture documentation:

```
docs/
├── plan-app-to-rsc-and-parallel-routes.md   ← Wave migration plan (app→RSC)
├── plan-workspace-architecture-2026.md      ← Workspace parallel-routes plan
├── architecture.md
├── backend.json
├── blueprints.md
├── boundaries.md
├── context.md
├── conventions.md
├── events.md
├── GEMINI.md
├── glossary.md
├── interactions.md
├── limits.md
├── performance.md
├── rules.md
├── schema.md
├── security.md
└── tools.md
```

---

## src/

### src/types/

Core domain types — no dependencies.

```
src/types/
├── domain.ts        ← All domain types: Account, Workspace, ScheduleItem, Capability, ...
├── GEMINI.md
└── README.md
```

### src/shared/

Globally shared, framework-agnostic. Import aliases: `@/shared/ui/*`, `@/shared/hooks/*`.

```
src/shared/
├── context/
│   ├── auth-context.tsx       ← Firebase Auth provider
│   ├── firebase-context.tsx
│   ├── i18n-context.tsx
│   └── theme-context.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── types/
│   ├── i18n.schema.ts
│   └── i18n.ts
├── ui/                        ← shadcn/ui components (55 components)
│   ├── skeleton.tsx           ← Use for ALL loading states
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── sheet.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── ...                    ← (all other shadcn components)
│   └── tooltip.tsx
├── utils/
│   ├── format-bytes.ts
│   ├── i18n.ts
│   └── utils.ts               ← cn(), hexToHsl()
└── README.md
```

### src/styles/

```
src/styles/
└── globals.css    ← Tailwind base + CSS custom properties
```

### src/infra/

External service I/O — Firebase adapters and repositories.

```
src/infra/
└── firebase/
    ├── analytics/
    │   ├── analytics.adapter.ts
    │   └── analytics.client.ts
    ├── auth/
    │   ├── auth.adapter.ts
    │   └── auth.client.ts
    ├── firestore/
    │   ├── repositories/
    │   │   ├── account.repository.ts
    │   │   ├── workspace.repository.ts
    │   │   └── index.ts
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
    └── firebase.config.ts
```

### src/entities/

Pure business logic — no React, no I/O, no network.

```
src/entities/
├── account/index.ts    ← isOwner, setupOrganizationWithTeam
├── schedule/index.ts   ← canTransitionScheduleStatus
├── user/index.ts       ← getUserTeamIds
├── workspace/index.ts  ← filterVisibleWorkspaces
└── index.ts            ← barrel
```

### src/actions/

Server boundary — pure async functions, no React. One subdirectory per domain.

```
src/actions/
├── account/index.ts    ← org CRUD, team, partner ops
├── auth/index.ts       ← register, login, logout
├── bookmark/index.ts   ← toggle, remove bookmark
├── daily/index.ts      ← toggleLike, addDailyLogComment
├── issue/index.ts      ← createIssue, addCommentToIssue
├── schedule/index.ts   ← create/assign/unassign/updateStatus
├── storage/index.ts    ← uploadFile, deleteFile
├── task/index.ts       ← createTask, updateTask, deleteTask, batchImportTasks
├── user/index.ts       ← updateProfile, createUserAccount
├── workspace/index.ts  ← createWorkspace, mountCapabilities, deleteWorkspace
└── index.ts            ← barrel re-export of all
```

### src/hooks/

Reusable React hooks. Three sub-layers.

```
src/hooks/
├── actions/
│   ├── use-bookmark-actions.ts
│   ├── use-daily-actions.ts
│   └── use-schedule-actions.ts
├── infra/
│   ├── use-logger.ts     ← intentional bridge (analytics) — only infra hook allowed outside infra/
│   └── use-storage.ts
└── state/
    ├── use-account-management.ts
    ├── use-account.ts
    ├── use-app.ts
    ├── use-user.ts
    └── use-visible-workspaces.ts
```

### src/context/

Domain React context providers. Import with `@/context/*`.

```
src/context/
├── account-context.tsx
├── app-context.tsx
├── workspace-context.tsx        ← WorkspaceProvider: wraps WorkspaceEventContext
└── workspace-event-context.tsx  ← WorkspaceEventContext + useWorkspaceEvents()
```

### src/features/

Use-case orchestration (`index.ts`) + view components (`*-view.tsx`).

```
src/features/
├── account/index.ts             ← setupOrganizationWithTeam
├── auth/index.ts                ← completeRegistration
├── members/
│   ├── index.ts
│   └── members-view.tsx         ← "use client" — MembersView
├── partners/
│   ├── index.ts
│   ├── partner-detail-view.tsx  ← PartnerDetailView
│   └── partners-view.tsx        ← PartnersView
├── schedule/index.ts            ← approveScheduleItem, rejectScheduleItem
├── teams/
│   ├── index.ts
│   ├── team-detail-view.tsx     ← TeamDetailView
│   └── teams-view.tsx           ← TeamsView
├── user-settings/
│   ├── index.ts
│   └── user-settings-view.tsx   ← UserSettingsView
├── workspace/index.ts           ← createWorkspaceWithCapabilities
└── index.ts                     ← barrel
```

### src/ai/

Generative AI (Genkit + Gemini). Provider abstraction in `providers/`.

```
src/ai/
├── flows/
│   ├── adapt-ui-color-to-account-context.ts
│   └── extract-invoice-items.ts
├── schemas/
│   └── docu-parse.ts
├── dev.ts
└── genkit.ts
```

---

## src/app/

Pure route tree + RSC boundaries only. No `useState`, `useEffect`, or custom hooks in page/layout files.

### src/app/ root

```
src/app/
├── layout.tsx    ← Root providers (Firebase, Auth, i18n, Theme)
└── page.tsx      ← Redirect to /dashboard
```

### src/app/(auth)/login/

```
(auth)/login/
├── _components/
│   ├── auth-background.tsx
│   ├── auth-tabs-root.tsx
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── reset-password-dialog.tsx
└── page.tsx
```

### src/app/dashboard/

```
dashboard/
├── _components/
│   ├── GEMINI.md
│   ├── layout/
│   │   ├── global-search.tsx
│   │   ├── header.tsx
│   │   ├── notification-center.tsx
│   │   └── theme-adapter.tsx
│   ├── overview/
│   │   ├── account-grid.tsx       ← AccountGrid (renamed from OrgGrid)
│   │   ├── permission-tree.tsx
│   │   ├── stat-cards.tsx
│   │   └── workspace-list.tsx
│   ├── settings/
│   │   ├── index.tsx
│   │   ├── preferences-card.tsx
│   │   ├── profile-card.tsx
│   │   ├── security-card.tsx
│   │   └── user-settings-overlay.tsx
│   └── sidebar/
│       ├── account-create-dialog.tsx   ← renamed from org-create-dialog
│       ├── account-switcher.tsx
│       ├── index.tsx
│       ├── nav-main.tsx
│       ├── nav-user.tsx
│       └── nav-workspaces.tsx
├── layout.tsx
└── page.tsx
```

### src/app/dashboard/account/

All pages are thin RSC wrappers delegating to `src/features/`:

```
account/
├── GEMINI.md
├── audit/page.tsx         ← AccountAuditView (from capabilities/)
├── daily/page.tsx         ← AccountDailyView (from capabilities/)
├── matrix/page.tsx
├── members/page.tsx       ← <MembersView />  (from features/members)
├── partners/
│   ├── [id]/page.tsx      ← <PartnerDetailView />
│   └── page.tsx           ← <PartnersView />
├── schedule/page.tsx      ← AccountScheduleView (from capabilities/)
├── settings/page.tsx      ← <UserSettingsView />
└── teams/
    ├── [id]/page.tsx      ← <TeamDetailView />
    └── page.tsx           ← <TeamsView />
```

### src/app/dashboard/workspaces/

```
workspaces/
├── GEMINI.md
├── _components/
│   ├── create-workspace-dialog.tsx
│   ├── workspace-card.tsx
│   ├── workspace-grid-view.tsx
│   ├── workspace-list-header.tsx
│   └── workspace-table-view.tsx
├── _lib/
│   ├── use-workspace-filters.ts
│   └── workspace-actions.ts
├── page.tsx               ← workspace list
└── [id]/
    ├── layout.tsx         ← WorkspaceProvider + @capability + @modal + @panel slots
    ├── page.tsx           ← RSC: server-side redirect → /capabilities
    │
    ├── @capability/       ← PARALLEL SLOT: renders active capability tab
    │   ├── default.tsx    ← null (inactive)
    │   ├── acceptance/
    │   │   ├── loading.tsx   ← <Skeleton> fallback
    │   │   └── page.tsx
    │   ├── audit/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── capabilities/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── daily/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── document-parser/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── files/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── finance/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── issues/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── members/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── qa/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   ├── schedule/
    │   │   ├── loading.tsx
    │   │   └── page.tsx
    │   └── tasks/
    │       ├── loading.tsx
    │       └── page.tsx
    │
    ├── @modal/            ← PARALLEL SLOT: overlay dialogs (future intercepting routes)
    │   └── default.tsx    ← null
    │
    ├── @panel/            ← PARALLEL SLOT: side panels (future intercepting routes)
    │   └── default.tsx    ← null
    │
    ├── _components/
    │   ├── workspace-nav-tabs.tsx   ← useSelectedLayoutSegment('capability')
    │   ├── workspace-settings.tsx
    │   └── workspace-status-bar.tsx
    │
    ├── _events/           ← Pure TS, zero React deps — keep as-is
    │   ├── workspace-event-bus.ts
    │   ├── workspace-event-handler.tsx
    │   └── workspace-events.ts
    │
    └── capabilities/      ← Capability UI components (to be moved to features/ in Wave 2)
        ├── acceptance/workspace-acceptance.tsx
        ├── audit/
        │   ├── _components/   ← audit-detail-sheet, audit-event-item, audit-timeline, audit-type-icon
        │   ├── _hooks/        ← use-workspace-audit, use-account-audit
        │   ├── audit.account.tsx    ← AccountAuditComponent
        │   ├── audit.view.tsx       ← AccountAuditView wrapper (used by account/audit/page.tsx)
        │   └── audit.workspace.tsx  ← WorkspaceAudit
        ├── capabilities/workspace-capabilities.tsx
        ├── daily/
        │   ├── _components/   ← composer, daily-log-card, daily-log-dialog, image-carousel, actions/
        │   ├── _hooks/        ← use-workspace-daily, use-daily-upload, use-aggregated-logs
        │   ├── daily.account.tsx    ← AccountDailyComponent
        │   ├── daily.view.tsx       ← AccountDailyView wrapper
        │   └── daily.workspace.tsx  ← WorkspaceDaily
        ├── document-parser/workspace-document-parser.component.tsx
        ├── files/workspace-files.tsx
        ├── finance/workspace-finance.tsx
        ├── issues/workspace-issues.tsx
        ├── members/
        │   ├── workspace-members-management.tsx
        │   └── workspace-members.tsx
        ├── qa/workspace-qa.tsx
        ├── schedule/
        │   ├── _components/   ← proposal-dialog, unified-calendar-grid, schedule-data-table, ...
        │   ├── _hooks/        ← use-workspace-schedule, use-global-schedule
        │   ├── schedule.account.tsx    ← AccountScheduleComponent
        │   ├── schedule.view.tsx       ← AccountScheduleView wrapper
        │   └── schedule.workspace.tsx  ← WorkspaceSchedule
        ├── tasks/
        │   ├── workspace-tasks.component.tsx
        │   ├── workspace-tasks.logic.ts
        │   └── workspace-tasks.types.ts
        └── index.ts           ← barrel export of all capability components
```

---

## Migration Status

### Completed ✅

| Item | Location |
|------|----------|
| `@capability` parallel slot (12 routes) | `[id]/@capability/*/page.tsx` |
| `loading.tsx` per capability (shadcn Skeleton) | `[id]/@capability/*/loading.tsx` |
| `error.tsx` per capability | `[id]/@capability/*/error.tsx` |
| `@modal` slot infrastructure | `[id]/@modal/default.tsx` |
| `@panel` slot infrastructure | `[id]/@panel/default.tsx` |
| `useSelectedLayoutSegment('capability')` active tab | `workspace-nav-tabs.tsx` |
| Server-side redirect for `[id]/page.tsx` | `[id]/page.tsx` (pure RSC) |
| `WorkspaceEventContext` + `useWorkspaceEvents()` | `context/workspace-event-context.tsx` |
| Wave 1 account pages → thin RSC wrappers | `account/members,teams,[id],partners,[id],settings` |
| Wave 1 features/ view components | `features/members,teams,partners,user-settings` |
| `PROJECT_STRUCTURE.md` updated | this file |

### Remaining (ordered by plan priority)

| Item | Plan | Status |
|------|------|--------|
| Wave 2: `audit` → `features/audit/` RSC boundary | plan-workspace §Wave2 | ❌ |
| Wave 2: `files` → `features/files/` RSC boundary | plan-workspace §Wave2 | ❌ |
| Wave 2: `workspace-members` → `features/workspace-members/` | plan-workspace §Wave2 | ❌ |
| Wave 2: `finance` → `features/finance/` RSC boundary | plan-workspace §Wave2 | ❌ |
| Wave 3a: Extract `DailyFeed` RSC from `daily.workspace.tsx` | plan-workspace §Wave3 | ❌ |
| Wave 3b: Extract `ScheduleCalendar` client island | plan-workspace §Wave3 | ❌ |
| Wave 3c: `DailyLogDialog` → `@modal/(.)daily-log/[id]/` intercept | plan-workspace §Wave3 | ❌ |
| Wave 3d: `ProposalDialog` → `@modal/(.)schedule-proposal/` intercept | plan-workspace §Wave3 | ❌ |
| Wave 4b: Replace `WorkspaceEventHandler` component with hook | plan-workspace §Wave4 | ❌ |
| Wave 4c: `@panel/@governance` slot for GovernanceSidebar | plan-workspace §Wave4 | ❌ |
| Wave 3 (app plan): auth/login → `features/auth/login-view.tsx` | plan-app §Wave3 | ❌ |
| Wave 4 (app plan): `dashboard/page.tsx` → `features/dashboard/` | plan-app §Wave4 | ❌ |
| `@modal` intercepting routes for 7 dialogs | plan-app §Priority1B | ❌ |
