.
├── apphosting.yaml
├── components.json
├── docs
│   ├── architecture.md
│   ├── backend.json
│   ├── blueprints.md
│   ├── boundaries.md
│   ├── context.md
│   ├── conventions.md
│   ├── events.md
│   ├── GEMINI.md
│   ├── glossary.md
│   ├── interactions.md
│   ├── limits.md
│   ├── performance.md
│   ├── rules.md
│   ├── schema.md
│   ├── security.md
│   └── tools.md
├── eslint.config.mts
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── functions
│   ├── GEMINI.md
│   ├── package.json
│   ├── src
│   │   └── index.ts
│   ├── tsconfig.dev.json
│   └── tsconfig.json
├── GEMINI.md
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── PROJECT_STRUCTURE.md
├── [Provide the ABSOLUTE, FULL path to the file being modified]
├── public
│   ├── localized-files
│   │   ├── en.json
│   │   ├── GEMINI.md
│   │   └── zh-TW.json
│   └── strings.json
├── README.md
├── src
│   ├── ai
│   │   ├── dev.ts
│   │   ├── flows
│   │   │   ├── adapt-ui-color-to-org-context.ts
│   │   │   └── extract-invoice-items.ts
│   │   ├── GEMINI.md
│   │   ├── genkit.ts
│   │   └── schemas
│   │       └── docu-parse.ts
│   ├── app
│   │   ├── (auth)
│   │   │   └── login
│   │   │       ├── _components
│   │   │       │   ├── auth-background.tsx
│   │   │       │   ├── auth-tabs-root.tsx
│   │   │       │   ├── login-form.tsx
│   │   │       │   ├── register-form.tsx
│   │   │       │   └── reset-password-dialog.tsx
│   │   │       └── page.tsx
│   │   ├── _components
│   │   │   ├── GEMINI.md
│   │   │   ├── language-switcher.tsx
│   │   │   └── ui
│   │   │       ├── accordion.tsx
│   │   │       ├── alert-dialog.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── aspect-ratio.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── breadcrumb.tsx
│   │   │       ├── button-group.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── carousel.tsx
│   │   │       ├── chart.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── collapsible.tsx
│   │   │       ├── command.tsx
│   │   │       ├── context-menu.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── drawer.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── empty.tsx
│   │   │       ├── field.tsx
│   │   │       ├── form.tsx
│   │   │       ├── hover-card.tsx
│   │   │       ├── input-group.tsx
│   │   │       ├── input-otp.tsx
│   │   │       ├── input.tsx
│   │   │       ├── item.tsx
│   │   │       ├── kbd.tsx
│   │   │       ├── label.tsx
│   │   │       ├── menubar.tsx
│   │   │       ├── navigation-menu.tsx
│   │   │       ├── pagination.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── progress.tsx
│   │   │       ├── radio-group.tsx
│   │   │       ├── scroll-area.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── slider.tsx
│   │   │       ├── sonner.tsx
│   │   │       ├── spinner.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── textarea.tsx
│   │   │       ├── timeline.tsx
│   │   │       ├── toaster.tsx
│   │   │       ├── toast.tsx
│   │   │       ├── toggle-group.tsx
│   │   │       ├── toggle.tsx
│   │   │       └── tooltip.tsx
│   │   ├── dashboard
│   │   │   ├── account
│   │   │   │   ├── audit
│   │   │   │   │   ├── audit.component.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── daily
│   │   │   │   │   ├── daily.component.tsx
│   │   │   │   │   ├── _hooks
│   │   │   │   │   │   └── use-aggregated-logs.ts
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── GEMINI.md
│   │   │   │   ├── matrix
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── members
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── partners
│   │   │   │   │   ├── [id]
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── schedule
│   │   │   │   │   ├── _components
│   │   │   │   │   │   ├── assign-member-popover.tsx
│   │   │   │   │   │   ├── conflict-resolver.tsx
│   │   │   │   │   │   ├── decision-history-columns.tsx
│   │   │   │   │   │   ├── governance-sidebar.tsx
│   │   │   │   │   │   ├── schedule-data-table.tsx
│   │   │   │   │   │   └── upcoming-events-columns.tsx
│   │   │   │   │   ├── _hooks
│   │   │   │   │   │   └── use-global-schedule.ts
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── schedule.component.tsx
│   │   │   │   ├── settings
│   │   │   │   │   └── page.tsx
│   │   │   │   └── teams
│   │   │   │       ├── [id]
│   │   │   │       │   └── page.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── _components
│   │   │   │   ├── audit
│   │   │   │   │   ├── audit-detail-sheet.tsx
│   │   │   │   │   ├── audit-event-item.tsx
│   │   │   │   │   ├── audit-timeline.tsx
│   │   │   │   │   └── audit-type-icon.tsx
│   │   │   │   ├── daily
│   │   │   │   │   ├── actions
│   │   │   │   │   │   ├── bookmark-button.tsx
│   │   │   │   │   │   ├── comment-button.tsx
│   │   │   │   │   │   ├── like-button.tsx
│   │   │   │   │   │   └── share-button.tsx
│   │   │   │   │   ├── composer.tsx
│   │   │   │   │   ├── daily-log-card.tsx
│   │   │   │   │   ├── daily-log-dialog.tsx
│   │   │   │   │   └── image-carousel.tsx
│   │   │   │   ├── GEMINI.md
│   │   │   │   ├── layout
│   │   │   │   │   ├── global-search.tsx
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   ├── notification-center.tsx
│   │   │   │   │   └── theme-adapter.tsx
│   │   │   │   ├── overview
│   │   │   │   │   ├── org-grid.tsx
│   │   │   │   │   ├── permission-tree.tsx
│   │   │   │   │   ├── stat-cards.tsx
│   │   │   │   │   └── workspace-list.tsx
│   │   │   │   ├── schedule
│   │   │   │   │   ├── schedule-item-card.tsx
│   │   │   │   │   ├── schedule-types.ts
│   │   │   │   │   └── unified-calendar-grid.tsx
│   │   │   │   ├── settings
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── preferences-card.tsx
│   │   │   │   │   ├── profile-card.tsx
│   │   │   │   │   ├── security-card.tsx
│   │   │   │   │   └── user-settings-overlay.tsx
│   │   │   │   └── sidebar
│   │   │   │       ├── account-switcher.tsx
│   │   │   │       ├── index.tsx
│   │   │   │       ├── nav-main.tsx
│   │   │   │       ├── nav-user.tsx
│   │   │   │       ├── nav-workspaces.tsx
│   │   │   │       └── org-create-dialog.tsx
│   │   │   ├── GEMINI.md
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── workspaces
│   │   │       ├── _components
│   │   │       │   ├── create-workspace-dialog.tsx
│   │   │       │   ├── workspace-card.tsx
│   │   │       │   ├── workspace-grid-view.tsx
│   │   │       │   ├── workspace-list-header.tsx
│   │   │       │   └── workspace-table-view.tsx
│   │   │       ├── GEMINI.md
│   │   │       ├── [id]
│   │   │       │   ├── capabilities
│   │   │       │   │   ├── acceptance
│   │   │       │   │   │   └── workspace-acceptance.tsx
│   │   │       │   │   ├── audit
│   │   │       │   │   │   └── workspace-audit.tsx
│   │   │       │   │   ├── capabilities
│   │   │       │   │   │   └── workspace-capabilities.tsx
│   │   │       │   │   ├── daily
│   │   │       │   │   │   ├── _hooks
│   │   │       │   │   │   │   └── use-daily-upload.ts
│   │   │       │   │   │   └── workspace-daily.tsx
│   │   │       │   │   ├── document-parser
│   │   │       │   │   │   ├── actions.ts
│   │   │       │   │   │   └── workspace-document-parser.component.tsx
│   │   │       │   │   ├── files
│   │   │       │   │   │   └── workspace-files.tsx
│   │   │       │   │   ├── finance
│   │   │       │   │   │   └── workspace-finance.tsx
│   │   │       │   │   ├── index.ts
│   │   │       │   │   ├── issues
│   │   │       │   │   │   └── workspace-issues.tsx
│   │   │       │   │   ├── members
│   │   │       │   │   │   ├── workspace-members-management.tsx
│   │   │       │   │   │   └── workspace-members.tsx
│   │   │       │   │   ├── qa
│   │   │       │   │   │   └── workspace-qa.tsx
│   │   │       │   │   ├── schedule
│   │   │       │   │   │   ├── _components
│   │   │       │   │   │   │   └── proposal-dialog.tsx
│   │   │       │   │   │   ├── _hooks
│   │   │       │   │   │   │   └── use-workspace-schedule.ts
│   │   │       │   │   │   ├── index.tsx
│   │   │       │   │   │   └── workspace-schedule.component.tsx
│   │   │       │   │   └── tasks
│   │   │       │   │       ├── workspace-tasks.component.tsx
│   │   │       │   │       ├── workspace-tasks.logic.ts
│   │   │       │   │       └── workspace-tasks.types.ts
│   │   │       │   ├── _components
│   │   │       │   │   ├── workspace-settings.tsx
│   │   │       │   │   ├── workspace-status-bar.tsx
│   │   │       │   │   └── workspace-tabs.tsx
│   │   │       │   ├── _events
│   │   │       │   │   ├── workspace-event-bus.ts
│   │   │       │   │   ├── workspace-event-handler.tsx
│   │   │       │   │   └── workspace-events.ts
│   │   │       │   ├── layout.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── _lib
│   │   │       │   ├── use-workspace-filters.ts
│   │   │       │   └── workspace-actions.ts
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── GEMINI.md
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── context
│   │   ├── account-context.tsx
│   │   ├── app-context.tsx
│   │   ├── auth-context.tsx
│   │   ├── firebase-context.tsx
│   │   ├── GEMINI.md
│   │   ├── i18n-context.tsx
│   │   ├── theme-context.tsx
│   │   └── workspace-context.tsx
│   ├── hooks
│   │   ├── actions
│   │   │   ├── use-bookmark-actions.ts
│   │   │   ├── use-daily-actions.ts
│   │   │   └── use-schedule-actions.ts
│   │   ├── GEMINI.md
│   │   ├── infra
│   │   │   ├── use-logger.ts
│   │   │   └── use-storage.ts
│   │   ├── state
│   │   │   ├── use-account.ts
│   │   │   ├── use-app.ts
│   │   │   ├── use-organization.ts
│   │   │   ├── use-user.ts
│   │   │   └── use-visible-workspaces.ts
│   │   └── ui
│   │       ├── use-mobile.tsx
│   │       └── use-toast.ts
│   ├── infra
│   │   ├── firebase
│   │   │   ├── analytics
│   │   │   │   ├── analytics.adapter.ts
│   │   │   │   └── analytics.client.ts
│   │   │   ├── app.client.ts
│   │   │   ├── auth
│   │   │   │   ├── auth.adapter.ts
│   │   │   │   └── auth.client.ts
│   │   │   ├── firebase.config.ts
│   │   │   ├── firestore
│   │   │   │   ├── firestore.client.ts
│   │   │   │   ├── firestore.converter.ts
│   │   │   │   ├── firestore.facade.ts
│   │   │   │   ├── firestore.read.adapter.ts
│   │   │   │   ├── firestore.write.adapter.ts
│   │   │   │   └── repositories
│   │   │   │       ├── account.repository.ts
│   │   │   │       ├── index.ts
│   │   │   │       ├── organization.repository.ts
│   │   │   │       ├── user.repository.ts
│   │   │   │       └── workspace.repository.ts
│   │   │   ├── messaging
│   │   │   │   ├── messaging.adapter.ts
│   │   │   │   └── messaging.client.ts
│   │   │   └── storage
│   │   │       ├── storage.client.ts
│   │   │       ├── storage.facade.ts
│   │   │       ├── storage.read.adapter.ts
│   │   │       └── storage.write.adapter.ts
│   │   └── GEMINI.md
│   ├── lib
│   │   ├── format.ts
│   │   ├── GEMINI.md
│   │   ├── i18n.ts
│   │   └── utils.ts
│   └── types
│       ├── domain.ts
│       ├── GEMINI.md
│       ├── i18n.schema.ts
│       └── i18n.ts
├── storage.rules
├── tailwind.config.ts
└── tsconfig.json

78 directories, 267 files
