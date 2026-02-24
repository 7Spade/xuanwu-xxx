.
├── apphosting.yaml
├── components.json
├── docs
│   ├── archive
│   │   ├── architecture.md
│   │   ├── architecture-overview.md
│   │   ├── backend.json
│   │   ├── blueprints.md
│   │   ├── boundaries.md
│   │   ├── context.md
│   │   ├── conventions.md
│   │   ├── data-flow-overview.md
│   │   ├── dependency-overview.md
│   │   ├── directory-tree-overview.md
│   │   ├── events.md
│   │   ├── GEMINI.md
│   │   ├── glossary.md
│   │   ├── interaction-overview.md
│   │   ├── interactions.md
│   │   ├── limits.md
│   │   ├── logic-overview.v1.md
│   │   ├── logic-overview.v2.md
│   │   ├── performance.md
│   │   ├── README.md
│   │   ├── rules.md
│   │   ├── schema.md
│   │   ├── security.md
│   │   ├── skill-tag-system.md
│   │   ├── structure-overview.md
│   │   ├── tools.md
│   │   └── vertical-slice-architecture.md
│   └── overview
│       ├── architecture-overview.md
│       ├── command-event-overview.v3.md
│       ├── infrastructure-overview.v3.md
│       ├── logic-overview.v3.md
│       ├── persistence-model-overview.v3.md
│       └── request-execution-overview.v3.md
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
├── repomix.config.ts
├── src
│   ├── app
│   │   ├── favicon.ico
│   │   ├── GEMINI.md
│   │   ├── layout.tsx
│   │   ├── (public)
│   │   │   ├── layout.tsx
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   ├── @modal
│   │   │   │   ├── default.tsx
│   │   │   │   └── (.)reset-password
│   │   │   │       └── page.tsx
│   │   │   └── reset-password
│   │   │       └── page.tsx
│   │   ├── README.md
│   │   └── (shell)
│   │       ├── (account)
│   │       │   ├── (dashboard)
│   │       │   │   └── dashboard
│   │       │   │       ├── account
│   │       │   │       │   ├── audit
│   │       │   │       │   │   └── page.tsx
│   │       │   │       │   ├── daily
│   │       │   │       │   │   └── page.tsx
│   │       │   │       │   ├── GEMINI.md
│   │       │   │       │   ├── matrix
│   │       │   │       │   │   └── page.tsx
│   │       │   │       │   ├── members
│   │       │   │       │   │   └── page.tsx
│   │       │   │       │   ├── new
│   │       │   │       │   │   └── page.tsx
│   │       │   │       │   ├── partners
│   │       │   │       │   │   ├── [id]
│   │       │   │       │   │   │   └── page.tsx
│   │       │   │       │   │   └── page.tsx
│   │       │   │       │   ├── schedule
│   │       │   │       │   │   └── page.tsx
│   │       │   │       │   ├── settings
│   │       │   │       │   │   └── page.tsx
│   │       │   │       │   └── teams
│   │       │   │       │       ├── [id]
│   │       │   │       │       │   └── page.tsx
│   │       │   │       │       └── page.tsx
│   │       │   │       ├── GEMINI.md
│   │       │   │       ├── @header
│   │       │   │       │   └── default.tsx
│   │       │   │       ├── layout.tsx
│   │       │   │       ├── @modal
│   │       │   │       │   ├── (.)account
│   │       │   │       │   │   └── new
│   │       │   │       │   │       └── page.tsx
│   │       │   │       │   └── default.tsx
│   │       │   │       └── page.tsx
│   │       │   ├── layout.tsx
│   │       │   └── (workspaces)
│   │       │       └── workspaces
│   │       │           ├── GEMINI.md
│   │       │           ├── @header
│   │       │           │   └── default.tsx
│   │       │           ├── [id]
│   │       │           │   ├── daily-log
│   │       │           │   │   └── [logId]
│   │       │           │   │       └── page.tsx
│   │       │           │   ├── governance
│   │       │           │   │   └── page.tsx
│   │       │           │   ├── layout.tsx
│   │       │           │   ├── @modal
│   │       │           │   │   ├── (.)daily-log
│   │       │           │   │   │   └── [logId]
│   │       │           │   │   │       └── page.tsx
│   │       │           │   │   ├── default.tsx
│   │       │           │   │   ├── (.)schedule-proposal
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   └── (.)settings
│   │       │           │   │       └── page.tsx
│   │       │           │   ├── page.tsx
│   │       │           │   ├── @panel
│   │       │           │   │   ├── default.tsx
│   │       │           │   │   └── (.)governance
│   │       │           │   │       └── page.tsx
│   │       │           │   ├── @plugintab
│   │       │           │   │   ├── acceptance
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── audit
│   │       │           │   │   │   ├── loading.tsx
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── capabilities
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── daily
│   │       │           │   │   │   ├── loading.tsx
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── default.tsx
│   │       │           │   │   ├── document-parser
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── error.tsx
│   │       │           │   │   ├── files
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── finance
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── issues
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── loading.tsx
│   │       │           │   │   ├── members
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── quality-assurance
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   ├── schedule
│   │       │           │   │   │   ├── loading.tsx
│   │       │           │   │   │   └── page.tsx
│   │       │           │   │   └── tasks
│   │       │           │   │       ├── loading.tsx
│   │       │           │   │       └── page.tsx
│   │       │           │   ├── schedule-proposal
│   │       │           │   │   └── page.tsx
│   │       │           │   └── settings
│   │       │           │       └── page.tsx
│   │       │           ├── layout.tsx
│   │       │           ├── @modal
│   │       │           │   ├── default.tsx
│   │       │           │   └── (.)new
│   │       │           │       └── page.tsx
│   │       │           ├── new
│   │       │           │   └── page.tsx
│   │       │           └── page.tsx
│   │       ├── layout.tsx
│   │       ├── @modal
│   │       │   └── default.tsx
│   │       ├── page.tsx
│   │       └── @sidebar
│   │           └── default.tsx
│   ├── features
│   │   ├── account
│   │   │   ├── _components
│   │   │   │   ├── account-provider.tsx
│   │   │   │   └── stat-cards.tsx
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   └── use-account.ts
│   │   │   └── index.ts
│   │   ├── account-governance.notification-router
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── account-governance.policy
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── account-governance.role
│   │   │   ├── _components
│   │   │   │   ├── permission-matrix-view.tsx
│   │   │   │   └── permission-tree.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── account-organization.core
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   ├── account-grid.tsx
│   │   │   │   └── account-new-form.tsx
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   └── use-organization-management.ts
│   │   │   └── index.ts
│   │   ├── account-organization.event-bus
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── account-organization.member
│   │   │   ├── _actions.ts
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   └── use-member-management.ts
│   │   │   └── index.ts
│   │   ├── account-organization.partner
│   │   │   ├── _actions.ts
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   └── use-partner-management.ts
│   │   │   └── index.ts
│   │   ├── account-organization.policy
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── account-organization.schedule
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── account-organization.skill-tag
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── account-organization.team
│   │   │   ├── _actions.ts
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   └── use-team-management.ts
│   │   │   └── index.ts
│   │   ├── account-user.notification
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── account-user.profile
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   ├── preferences-card.tsx
│   │   │   │   ├── profile-card.tsx
│   │   │   │   ├── security-card.tsx
│   │   │   │   ├── user-settings.tsx
│   │   │   │   └── user-settings-view.tsx
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   └── use-user.ts
│   │   │   └── index.ts
│   │   ├── account-user.wallet
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── GEMINI.md
│   │   ├── identity-account.auth
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   ├── auth-background.tsx
│   │   │   │   ├── auth-tabs-root.tsx
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── login-view.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   ├── reset-password-dialog.tsx
│   │   │   │   └── reset-password-form.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── projection.account-audit
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── projection.account-schedule
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── projection.account-view
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── projection.organization-view
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── projection.registry
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── projection.workspace-scope-guard
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── projection.workspace-view
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── tree.md
│   │   ├── workspace-application
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-business.acceptance
│   │   │   ├── _components
│   │   │   │   └── acceptance-plugin.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-business.daily
│   │   │   ├── _actions.ts
│   │   │   ├── _bookmark-actions.ts
│   │   │   ├── _components
│   │   │   │   ├── actions
│   │   │   │   │   ├── bookmark-button.tsx
│   │   │   │   │   ├── comment-button.tsx
│   │   │   │   │   ├── like-button.tsx
│   │   │   │   │   └── share-button.tsx
│   │   │   │   ├── composer.tsx
│   │   │   │   ├── daily.account-view.tsx
│   │   │   │   ├── daily-log-card.tsx
│   │   │   │   ├── daily-log-dialog.tsx
│   │   │   │   ├── daily.view.tsx
│   │   │   │   ├── daily.workspace-view.tsx
│   │   │   │   └── image-carousel.tsx
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   ├── use-aggregated-logs.ts
│   │   │   │   ├── use-bookmark-commands.ts
│   │   │   │   ├── use-daily-commands.ts
│   │   │   │   ├── use-daily-upload.ts
│   │   │   │   └── use-workspace-daily.ts
│   │   │   └── index.ts
│   │   ├── workspace-business.document-parser
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   └── document-parser-plugin.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-business.files
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   └── files-plugin.tsx
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   ├── use-storage.ts
│   │   │   │   └── use-workspace-filters.ts
│   │   │   ├── index.ts
│   │   │   └── _storage-actions.ts
│   │   ├── workspace-business.finance
│   │   │   ├── _components
│   │   │   │   └── finance-plugin.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-business.issues
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   └── issues-plugin.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-business.quality-assurance
│   │   │   ├── _components
│   │   │   │   └── qa-plugin.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-business.schedule
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-business.tasks
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   └── tasks-plugin.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-core
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   ├── app-provider.tsx
│   │   │   │   ├── create-workspace-dialog.tsx
│   │   │   │   ├── dashboard-view.tsx
│   │   │   │   ├── workspace-capabilities.tsx
│   │   │   │   ├── workspace-card.tsx
│   │   │   │   ├── workspace-grid-view.tsx
│   │   │   │   ├── workspace-list-header.tsx
│   │   │   │   ├── workspace-list.tsx
│   │   │   │   ├── workspace-nav-tabs.tsx
│   │   │   │   ├── workspace-provider.tsx
│   │   │   │   ├── workspace-settings.tsx
│   │   │   │   ├── workspace-status-bar.tsx
│   │   │   │   ├── workspaces-view.tsx
│   │   │   │   └── workspace-table-view.tsx
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   ├── use-app.ts
│   │   │   │   ├── use-visible-workspaces.ts
│   │   │   │   ├── use-workspace-commands.ts
│   │   │   │   └── use-workspace-event-handler.tsx
│   │   │   ├── index.ts
│   │   │   ├── _shell
│   │   │   │   ├── account-create-dialog.tsx
│   │   │   │   ├── account-switcher.tsx
│   │   │   │   ├── dashboard-sidebar.tsx
│   │   │   │   ├── global-search.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── nav-main.tsx
│   │   │   │   ├── nav-user.tsx
│   │   │   │   ├── nav-workspaces.tsx
│   │   │   │   ├── notification-center.tsx
│   │   │   │   └── theme-adapter.tsx
│   │   │   └── _use-cases.ts
│   │   ├── workspace-core.event-bus
│   │   │   ├── _bus.ts
│   │   │   ├── _context.ts
│   │   │   ├── _events.ts
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-core.event-store
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-governance.audit
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   ├── audit.account-view.tsx
│   │   │   │   ├── audit-detail-sheet.tsx
│   │   │   │   ├── audit-event-item.tsx
│   │   │   │   ├── audit-timeline.tsx
│   │   │   │   ├── audit-type-icon.tsx
│   │   │   │   ├── audit.view.tsx
│   │   │   │   └── audit.workspace-view.tsx
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   ├── use-account-audit.ts
│   │   │   │   ├── use-logger.ts
│   │   │   │   └── use-workspace-audit.ts
│   │   │   └── index.ts
│   │   ├── workspace-governance.members
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   ├── members-plugin.tsx
│   │   │   │   └── members-view.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-governance.partners
│   │   │   ├── _components
│   │   │   │   ├── partner-detail-view.tsx
│   │   │   │   └── partners-view.tsx
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-governance.role
│   │   │   ├── GEMINI.md
│   │   │   └── index.ts
│   │   ├── workspace-governance.schedule
│   │   │   ├── _actions.ts
│   │   │   ├── _components
│   │   │   │   ├── decision-history-columns.tsx
│   │   │   │   ├── governance-sidebar.tsx
│   │   │   │   ├── proposal-dialog.tsx
│   │   │   │   ├── schedule.account-view.tsx
│   │   │   │   ├── schedule-data-table.tsx
│   │   │   │   ├── schedule-proposal-content.tsx
│   │   │   │   ├── schedule.workspace-view.tsx
│   │   │   │   ├── unified-calendar-grid.tsx
│   │   │   │   └── upcoming-events-columns.tsx
│   │   │   ├── GEMINI.md
│   │   │   ├── _hooks
│   │   │   │   ├── use-global-schedule.ts
│   │   │   │   ├── use-schedule-commands.ts
│   │   │   │   └── use-workspace-schedule.ts
│   │   │   └── index.ts
│   │   └── workspace-governance.teams
│   │       ├── _components
│   │       │   ├── team-detail-view.tsx
│   │       │   └── teams-view.tsx
│   │       ├── GEMINI.md
│   │       └── index.ts
│   ├── shared
│   │   ├── ai
│   │   │   ├── dev.ts
│   │   │   ├── flows
│   │   │   │   ├── adapt-ui-color-to-account-context.ts
│   │   │   │   └── extract-invoice-items.ts
│   │   │   ├── GEMINI.md
│   │   │   ├── genkit.ts
│   │   │   ├── index.ts
│   │   │   └── schemas
│   │   │       └── docu-parse.ts
│   │   ├── app-providers
│   │   │   ├── auth-provider.tsx
│   │   │   ├── firebase-provider.tsx
│   │   │   ├── i18n-provider.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── config
│   │   │   └── README.md
│   │   ├── constants
│   │   │   ├── README.md
│   │   │   ├── routes.ts
│   │   │   └── skills.ts
│   │   ├── FLOWS.md
│   │   ├── GEMINI.md
│   │   ├── i18n-types
│   │   │   ├── i18n.schema.ts
│   │   │   ├── i18n.ts
│   │   │   └── README.md
│   │   ├── infra
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
│   │   │   │   ├── firestore.utils.ts
│   │   │   │   ├── firestore.write.adapter.ts
│   │   │   │   └── repositories
│   │   │   │       ├── account.repository.ts
│   │   │   │       ├── audit.repository.ts
│   │   │   │       ├── daily.repository.ts
│   │   │   │       ├── index.ts
│   │   │   │       ├── schedule.repository.ts
│   │   │   │       ├── user.repository.ts
│   │   │   │       └── workspace.repository.ts
│   │   │   ├── GEMINI.md
│   │   │   ├── index.ts
│   │   │   ├── messaging
│   │   │   │   ├── messaging.adapter.ts
│   │   │   │   └── messaging.client.ts
│   │   │   └── storage
│   │   │       ├── storage.client.ts
│   │   │       ├── storage.facade.ts
│   │   │       ├── storage.read.adapter.ts
│   │   │       └── storage.write.adapter.ts
│   │   ├── lib
│   │   │   ├── account.rules.ts
│   │   │   ├── format-bytes.ts
│   │   │   ├── GEMINI.md
│   │   │   ├── i18n.ts
│   │   │   ├── index.ts
│   │   │   ├── schedule.rules.ts
│   │   │   ├── skill.rules.ts
│   │   │   ├── task.rules.ts
│   │   │   ├── user.rules.ts
│   │   │   ├── utils.ts
│   │   │   └── workspace.rules.ts
│   │   ├── README.md
│   │   ├── shadcn-ui
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button-group.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── empty.tsx
│   │   │   ├── field.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-group.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── item.tsx
│   │   │   ├── kbd.tsx
│   │   │   ├── label.tsx
│   │   │   ├── language-switcher.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── page-header.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── timeline.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── tooltip.tsx
│   │   ├── types
│   │   │   ├── account.types.ts
│   │   │   ├── audit.types.ts
│   │   │   ├── daily.types.ts
│   │   │   ├── GEMINI.md
│   │   │   ├── index.ts
│   │   │   ├── schedule.types.ts
│   │   │   ├── skill.types.ts
│   │   │   ├── task.types.ts
│   │   │   └── workspace.types.ts
│   │   ├── ui
│   │   │   └── GEMINI.md
│   │   ├── utility-hooks
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   └── utils
│   │       ├── format-bytes.ts
│   │       ├── i18n.ts
│   │       ├── README.md
│   │       └── utils.ts
│   └── styles
│       ├── GEMINI.md
│       ├── globals.css
│       └── README.md
├── storage.rules
├── tailwind.config.ts
└── tsconfig.json

166 directories, 478 files
