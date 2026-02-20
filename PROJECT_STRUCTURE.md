.
├── apphosting.yaml
├── components.json          ← shadcn config: ui→@/shared/ui, utils→@/shared/utils/utils
├── docs
│   ├── architecture.md
│   ├── backend.json
│   ├── blueprints.md
│   ├── boundaries.md
│   ├── context.md
│   ├── conventions.md
│   ├── events.md
│   ├── GEMINI.md
│   ├── glossary.md
│   ├── interactions.md
│   ├── limits.md
│   ├── performance.md
│   ├── plan-app-to-rsc-and-parallel-routes.md  ← Migration plan (app→RSC)
│   ├── plan-workspace-architecture-2026.md      ← Workspace architecture plan
│   ├── rules.md
│   ├── schema.md
│   ├── security.md
│   └── tools.md
├── eslint.config.mts
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── functions
│   ├── GEMINI.md
│   ├── package.json
│   ├── src
│   │   └── index.ts
│   ├── tsconfig.dev.json
│   └── tsconfig.json
├── GEMINI.md
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── PROJECT_STRUCTURE.md
├── public
│   ├── localized-files
│   │   ├── en.json
│   │   ├── GEMINI.md
│   │   └── zh-TW.json
│   └── strings.json
├── README.md
├── src
│   │
│   │  ┌─────────────────────────────────────────────────────────────────────┐
│   │  │  LAYER ARCHITECTURE (one-way dependency):                            │
│   │  │  app → features → actions → entities → infra → lib → types          │
│   │  │  shared/ = globally shared primitives (shadcn ui, providers, utils)  │
│   │  └─────────────────────────────────────────────────────────────────────┘
│   │
│   ├── actions/                   ← Server boundary: pure async functions, no React
│   │   ├── account/index.ts       ← org CRUD, team, partner ops
│   │   ├── auth/index.ts          ← register, login, logout
│   │   ├── bookmark/index.ts      ← toggle, remove bookmark
│   │   ├── daily/index.ts         ← toggleLike, addDailyLogComment
│   │   ├── issue/index.ts         ← createIssue, addCommentToIssue
│   │   ├── schedule/index.ts      ← create/assign/unassign/updateStatus
│   │   ├── storage/index.ts       ← uploadFile, deleteFile
│   │   ├── task/index.ts          ← createTask, updateTask, deleteTask, batchImportTasks
│   │   ├── user/index.ts          ← updateProfile, createUserAccount
│   │   ├── workspace/index.ts     ← createWorkspace, mountCapabilities, deleteWorkspace
│   │   ├── GEMINI.md
│   │   ├── README.md
│   │   └── index.ts               ← barrel re-export of all actions
│   │
│   ├── ai/                        ← Generative AI (Genkit + Gemini)
│   │   ├── flows/
│   │   │   ├── adapt-ui-color-to-account-context.ts
│   │   │   └── extract-invoice-items.ts
│   │   ├── schemas/
│   │   │   └── docu-parse.ts
│   │   ├── GEMINI.md
│   │   ├── README.md
│   │   ├── dev.ts
│   │   └── genkit.ts
│   │
│   ├── app/                       ← Pure route tree + RSC boundary only
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       ├── _components/
│   │   │       │   ├── auth-background.tsx
│   │   │       │   ├── auth-tabs-root.tsx
│   │   │       │   ├── login-form.tsx
│   │   │       │   ├── register-form.tsx
│   │   │       │   └── reset-password-dialog.tsx
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── _components/
│   │   │   │   ├── GEMINI.md
│   │   │   │   ├── layout/
│   │   │   │   │   ├── global-search.tsx
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   ├── notification-center.tsx
│   │   │   │   │   └── theme-adapter.tsx
│   │   │   │   ├── overview/
│   │   │   │   │   ├── account-grid.tsx
│   │   │   │   │   ├── permission-tree.tsx
│   │   │   │   │   ├── stat-cards.tsx
│   │   │   │   │   └── workspace-list.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── preferences-card.tsx
│   │   │   │   │   ├── profile-card.tsx
│   │   │   │   │   ├── security-card.tsx
│   │   │   │   │   └── user-settings-overlay.tsx
│   │   │   │   └── sidebar/
│   │   │   │       ├── account-create-dialog.tsx
│   │   │   │       ├── account-switcher.tsx
│   │   │   │       ├── index.tsx
│   │   │   │       ├── nav-main.tsx
│   │   │   │       ├── nav-user.tsx
│   │   │   │       └── nav-workspaces.tsx
│   │   │   ├── account/
│   │   │   │   ├── GEMINI.md
│   │   │   │   ├── audit/page.tsx           ← thin: <AccountAuditComponent />
│   │   │   │   ├── daily/page.tsx           ← thin: <AccountDailyComponent />
│   │   │   │   ├── matrix/page.tsx
│   │   │   │   ├── members/page.tsx         ← thin RSC: <MembersView />
│   │   │   │   ├── partners/
│   │   │   │   │   ├── [id]/page.tsx        ← thin RSC: <PartnerDetailView />
│   │   │   │   │   └── page.tsx             ← thin RSC: <PartnersView />
│   │   │   │   ├── schedule/page.tsx        ← thin: <AccountScheduleComponent />
│   │   │   │   ├── settings/page.tsx        ← thin RSC: <UserSettingsView />
│   │   │   │   └── teams/
│   │   │   │       ├── [id]/page.tsx        ← thin RSC: <TeamDetailView />
│   │   │   │       └── page.tsx             ← thin RSC: <TeamsView />
│   │   │   ├── workspaces/
│   │   │   │   ├── GEMINI.md
│   │   │   │   ├── _components/
│   │   │   │   │   ├── create-workspace-dialog.tsx
│   │   │   │   │   ├── workspace-card.tsx
│   │   │   │   │   ├── workspace-grid-view.tsx
│   │   │   │   │   ├── workspace-list-header.tsx
│   │   │   │   │   └── workspace-table-view.tsx
│   │   │   │   ├── _lib/
│   │   │   │   │   ├── use-workspace-filters.ts
│   │   │   │   │   └── workspace-actions.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── @capability/         ← PARALLEL SLOT: active capability tab
│   │   │   │   │   │   ├── default.tsx      ← null (inactive default)
│   │   │   │   │   │   ├── acceptance/
│   │   │   │   │   │   │   ├── loading.tsx  ← <Skeleton> fallback (shadcn)
│   │   │   │   │   │   │   └── page.tsx     ← thin: <WorkspaceAcceptance />
│   │   │   │   │   │   ├── audit/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── capabilities/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── daily/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── document-parser/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── files/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── finance/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── issues/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── members/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── qa/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── schedule/
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── tasks/
│   │   │   │   │   │       ├── loading.tsx
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── @modal/              ← PARALLEL SLOT: overlay dialogs (future)
│   │   │   │   │   │   └── default.tsx      ← null
│   │   │   │   │   ├── @panel/              ← PARALLEL SLOT: side panels (future)
│   │   │   │   │   │   └── default.tsx      ← null
│   │   │   │   │   ├── _components/
│   │   │   │   │   │   ├── workspace-nav-tabs.tsx  ← useSelectedLayoutSegment('capability')
│   │   │   │   │   │   ├── workspace-settings.tsx
│   │   │   │   │   │   ├── workspace-status-bar.tsx
│   │   │   │   │   │   └── workspace-tabs.tsx      ← LEGACY (to be removed)
│   │   │   │   │   ├── _events/             ← Pure TS event bus
│   │   │   │   │   │   ├── workspace-event-bus.ts
│   │   │   │   │   │   ├── workspace-event-handler.tsx
│   │   │   │   │   │   └── workspace-events.ts
│   │   │   │   │   ├── capabilities/        ← Capability UI components
│   │   │   │   │   │   ├── acceptance/workspace-acceptance.tsx
│   │   │   │   │   │   ├── audit/
│   │   │   │   │   │   │   ├── _components/
│   │   │   │   │   │   │   │   ├── audit-detail-sheet.tsx
│   │   │   │   │   │   │   │   ├── audit-event-item.tsx
│   │   │   │   │   │   │   │   ├── audit-timeline.tsx
│   │   │   │   │   │   │   │   └── audit-type-icon.tsx
│   │   │   │   │   │   │   ├── _hooks/
│   │   │   │   │   │   │   │   ├── use-account-audit.ts
│   │   │   │   │   │   │   │   └── use-workspace-audit.ts
│   │   │   │   │   │   │   ├── audit.account.tsx    ← AccountAuditComponent
│   │   │   │   │   │   │   ├── audit.view.tsx
│   │   │   │   │   │   │   └── audit.workspace.tsx  ← WorkspaceAudit
│   │   │   │   │   │   ├── capabilities/workspace-capabilities.tsx
│   │   │   │   │   │   ├── daily/
│   │   │   │   │   │   │   ├── _components/
│   │   │   │   │   │   │   │   ├── actions/
│   │   │   │   │   │   │   │   │   ├── bookmark-button.tsx
│   │   │   │   │   │   │   │   │   ├── comment-button.tsx
│   │   │   │   │   │   │   │   │   ├── like-button.tsx
│   │   │   │   │   │   │   │   │   └── share-button.tsx
│   │   │   │   │   │   │   │   ├── composer.tsx
│   │   │   │   │   │   │   │   ├── daily-log-card.tsx
│   │   │   │   │   │   │   │   ├── daily-log-dialog.tsx
│   │   │   │   │   │   │   │   └── image-carousel.tsx
│   │   │   │   │   │   │   ├── _hooks/
│   │   │   │   │   │   │   │   ├── use-aggregated-logs.ts
│   │   │   │   │   │   │   │   ├── use-daily-upload.ts
│   │   │   │   │   │   │   │   └── use-workspace-daily.ts
│   │   │   │   │   │   │   ├── daily.account.tsx    ← AccountDailyComponent
│   │   │   │   │   │   │   ├── daily.view.tsx
│   │   │   │   │   │   │   └── daily.workspace.tsx  ← WorkspaceDaily
│   │   │   │   │   │   ├── document-parser/
│   │   │   │   │   │   │   ├── actions.ts
│   │   │   │   │   │   │   └── workspace-document-parser.component.tsx
│   │   │   │   │   │   ├── files/workspace-files.tsx
│   │   │   │   │   │   ├── finance/workspace-finance.tsx
│   │   │   │   │   │   ├── issues/workspace-issues.tsx
│   │   │   │   │   │   ├── members/
│   │   │   │   │   │   │   ├── workspace-members-management.tsx
│   │   │   │   │   │   │   └── workspace-members.tsx
│   │   │   │   │   │   ├── qa/workspace-qa.tsx
│   │   │   │   │   │   ├── schedule/
│   │   │   │   │   │   │   ├── _components/
│   │   │   │   │   │   │   │   ├── decision-history-columns.tsx
│   │   │   │   │   │   │   │   ├── governance-sidebar.tsx
│   │   │   │   │   │   │   │   ├── proposal-dialog.tsx
│   │   │   │   │   │   │   │   ├── schedule-data-table.tsx
│   │   │   │   │   │   │   │   ├── unified-calendar-grid.tsx
│   │   │   │   │   │   │   │   └── upcoming-events-columns.tsx
│   │   │   │   │   │   │   ├── _hooks/
│   │   │   │   │   │   │   │   ├── use-global-schedule.ts
│   │   │   │   │   │   │   │   └── use-workspace-schedule.ts
│   │   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   │   │   ├── schedule.account.tsx ← AccountScheduleComponent
│   │   │   │   │   │   │   ├── schedule.view.tsx
│   │   │   │   │   │   │   └── schedule.workspace.tsx ← WorkspaceSchedule
│   │   │   │   │   │   ├── tasks/
│   │   │   │   │   │   │   ├── workspace-tasks.component.tsx
│   │   │   │   │   │   │   ├── workspace-tasks.logic.ts
│   │   │   │   │   │   │   └── workspace-tasks.types.ts
│   │   │   │   │   │   └── index.ts         ← barrel export of all capability components
│   │   │   │   │   ├── layout.tsx           ← WorkspaceProvider + @capability + @modal + @panel
│   │   │   │   │   └── page.tsx             ← RSC: server-side redirect to /capabilities
│   │   │   │   └── page.tsx                 ← workspace list page
│   │   │   ├── GEMINI.md
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── GEMINI.md
│   │   ├── README.md
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── context/                   ← Domain-scoped React contexts
│   │   ├── GEMINI.md
│   │   ├── README.md
│   │   ├── account-context.tsx
│   │   ├── app-context.tsx
│   │   ├── workspace-context.tsx        ← WorkspaceProvider; wraps WorkspaceEventContext
│   │   └── workspace-event-context.tsx  ← WorkspaceEventContext + useWorkspaceEvents()
│   │
│   ├── entities/                  ← Pure business logic, no React, no I/O
│   │   ├── GEMINI.md
│   │   ├── README.md
│   │   ├── account/index.ts
│   │   ├── schedule/index.ts      ← canTransitionScheduleStatus
│   │   ├── user/index.ts          ← getUserTeamIds
│   │   ├── workspace/index.ts     ← filterVisibleWorkspaces
│   │   └── index.ts               ← barrel
│   │
│   ├── features/                  ← Use-case orchestration + view components
│   │   ├── GEMINI.md
│   │   ├── README.md
│   │   ├── account/index.ts       ← setupOrganizationWithTeam
│   │   ├── auth/index.ts          ← completeRegistration
│   │   ├── members/
│   │   │   ├── index.ts
│   │   │   └── members-view.tsx   ← "use client" MembersView
│   │   ├── partners/
│   │   │   ├── index.ts
│   │   │   ├── partner-detail-view.tsx
│   │   │   └── partners-view.tsx
│   │   ├── schedule/index.ts      ← approveScheduleItem, rejectScheduleItem
│   │   ├── teams/
│   │   │   ├── index.ts
│   │   │   ├── team-detail-view.tsx
│   │   │   └── teams-view.tsx
│   │   ├── user-settings/
│   │   │   ├── index.ts
│   │   │   └── user-settings-view.tsx
│   │   ├── workspace/index.ts     ← createWorkspaceWithCapabilities
│   │   └── index.ts               ← barrel
│   │
│   ├── hooks/                     ← Reusable React hooks
│   │   ├── GEMINI.md
│   │   ├── README.md
│   │   ├── actions/               ← hooks that wrap action calls
│   │   │   ├── use-bookmark-actions.ts
│   │   │   ├── use-daily-actions.ts
│   │   │   └── use-schedule-actions.ts
│   │   ├── infra/                 ← hooks with direct infra access
│   │   │   ├── use-logger.ts      ← intentional bridge (analytics)
│   │   │   └── use-storage.ts
│   │   └── state/                 ← hooks that read domain context state
│   │       ├── use-account-management.ts
│   │       ├── use-account.ts
│   │       ├── use-app.ts
│   │       ├── use-user.ts
│   │       └── use-visible-workspaces.ts
│   │
│   ├── infra/                     ← Firebase I/O: adapters + repositories
│   │   ├── GEMINI.md
│   │   ├── README.md
│   │   └── firebase/
│   │       ├── analytics/
│   │       │   ├── analytics.adapter.ts
│   │       │   └── analytics.client.ts
│   │       ├── auth/
│   │       │   ├── auth.adapter.ts
│   │       │   └── auth.client.ts
│   │       ├── firestore/
│   │       │   ├── repositories/
│   │       │   │   ├── account.repository.ts
│   │       │   │   ├── index.ts
│   │       │   │   └── workspace.repository.ts
│   │       │   ├── firestore.client.ts
│   │       │   ├── firestore.converter.ts
│   │       │   ├── firestore.facade.ts
│   │       │   ├── firestore.read.adapter.ts
│   │       │   ├── firestore.utils.ts
│   │       │   └── firestore.write.adapter.ts
│   │       ├── messaging/
│   │       │   ├── messaging.adapter.ts
│   │       │   └── messaging.client.ts
│   │       ├── storage/
│   │       │   ├── storage.client.ts
│   │       │   ├── storage.facade.ts
│   │       │   ├── storage.read.adapter.ts
│   │       │   └── storage.write.adapter.ts
│   │       ├── app.client.ts
│   │       └── firebase.config.ts
│   │
│   ├── shared/                    ← Globally shared primitives
│   │   ├── README.md
│   │   ├── config/README.md
│   │   ├── constants/README.md
│   │   ├── context/               ← Infrastructure providers
│   │   │   ├── auth-context.tsx
│   │   │   ├── firebase-context.tsx
│   │   │   ├── i18n-context.tsx
│   │   │   └── theme-context.tsx
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── types/
│   │   │   ├── README.md
│   │   │   ├── i18n.schema.ts
│   │   │   └── i18n.ts
│   │   ├── ui/                    ← shadcn/ui components — import as @/shared/ui/{name}
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button-group.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── empty.tsx
│   │   │   ├── field.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-group.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── item.tsx
│   │   │   ├── kbd.tsx
│   │   │   ├── label.tsx
│   │   │   ├── language-switcher.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx       ← Use for ALL loading states, never raw divs
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── timeline.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── tooltip.tsx
│   │   └── utils/
│   │       ├── README.md
│   │       ├── format-bytes.ts
│   │       ├── i18n.ts
│   │       └── utils.ts           ← cn(), hexToHsl()
│   │
│   ├── styles/
│   │   ├── README.md
│   │   └── globals.css            ← Tailwind base + CSS custom properties
│   │
│   └── types/
│       ├── GEMINI.md
│       ├── README.md
│       └── domain.ts              ← All domain types (Account, Workspace, ScheduleItem, …)
│
├── storage.rules
├── tailwind.config.ts
└── tsconfig.json
