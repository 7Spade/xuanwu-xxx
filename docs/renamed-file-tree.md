# Renamed File Tree: Zero-Cognitive-Load Naming

> **目的**：讓每一層的資料夾/檔案名稱直接揭示技術角色，不需要讀 README 就能理解。
>
> **方針**：不直接改動代碼，僅作名稱規劃。

---

## 命名原則

| 原則 | 規則 |
|------|------|
| 角色詞優先 | 每個資料夾名稱必須包含「它是什麼、它做什麼」的角色詞 |
| 禁用抽象名詞 | 禁止：`actions`、`features`、`capabilities`、`entities`（概念容器，沒有揭示責任） |
| Plugin 顯性化 | workspace 的 capability 系統改名為 `plugin`，揭示「可掛載/卸載」的概念 |
| Route ≠ View 分離 | Route 文件留在 `app/`（`page.tsx`/`layout.tsx`/`slot`）；View component 明確帶 `-view` 後綴 |
| 技術棧可見 | infra 資料夾名稱包含服務名稱（firebase）；AI 資料夾包含 runtime 名稱（genkit） |
| 限定詞在前 | 形容詞在名詞前：`server-commands`、`domain-rules`、`react-providers` |

---

## 層級轉換對照表

| 現行名稱 | 建議名稱 | 揭露的角色 |
|----------|----------|------------|
| `src/types/` | `src/domain-types/` | 領域 TypeScript 型別定義 |
| `src/entities/` | `src/domain-rules/` | 純業務規則函式（無 I/O、無 React） |
| `src/infra/firebase/` | `src/firebase/` | Firebase SDK 客戶端 + 適配器（移除抽象的 `infra/` 包裝層） |
| `src/actions/` | `src/server-commands/` | Server 邊界命令函式 |
| `src/hooks/` | `src/react-hooks/` | React Hook 庫 |
| `src/hooks/actions/` | `src/react-hooks/command-hooks/` | 包裝 server command 的 hooks |
| `src/hooks/infra/` | `src/react-hooks/service-hooks/` | 橋接外部服務的 hooks |
| `src/hooks/state/` | `src/react-hooks/state-hooks/` | 管理領域狀態的 hooks |
| `src/context/` | `src/react-providers/` | 領域 React Context Provider |
| `src/features/…/index.ts` | `src/use-cases/…/index.ts` | 多步驟 use-case 協調器（純 TS，無 React） |
| `src/features/…/*-view.tsx` | `src/view-modules/…/*-view.tsx` | Client 視圖元件（`"use client"`） |
| `src/ai/` | `src/genkit-flows/` | Genkit AI 流程定義 |
| `src/shared/ui/` | `src/shared/shadcn-ui/` | shadcn/ui 元件庫（明確來源） |
| `src/shared/context/` | `src/shared/app-providers/` | App 級 React Context Provider |
| `src/shared/hooks/` | `src/shared/utility-hooks/` | 通用工具 hooks（非領域）|
| `src/shared/types/` | `src/shared/i18n-types/` | i18n 型別定義（更具體） |
| `[id]/@capability/` | `[id]/@plugin-tab/` | 平行 slot：目前啟用的 plugin tab |
| `[id]/capabilities/` | `[id]/plugins/` | Workspace plugin UI 實作 |
| `capabilities/_components/` | `plugins/_plugin-components/` | Plugin 私有 UI 元件 |
| `capabilities/_hooks/` | `plugins/_plugin-hooks/` | Plugin 私有 hooks |
| `capabilities/audit.workspace.tsx` | `plugins/audit.workspace-view.tsx` | 揭示：view component |
| `capabilities/audit.account.tsx` | `plugins/audit.account-view.tsx` | 揭示：view component |
| `workspace-document-parser.component.tsx` | `document-parser-plugin.tsx` | 揭示：plugin 角色 |
| `workspace-files.tsx` | `files-plugin.tsx` | 揭示：plugin 角色 |
| `workspace-finance.tsx` | `finance-plugin.tsx` | 揭示：plugin 角色 |
| `workspace-issues.tsx` | `issues-plugin.tsx` | 揭示：plugin 角色 |
| `workspace-qa.tsx` | `qa-plugin.tsx` | 揭示：plugin 角色 |
| `workspace-tasks.component.tsx` | `tasks-plugin.tsx` | 揭示：plugin 角色 |
| `workspace-tasks.logic.ts` | `tasks-plugin.logic.ts` | 揭示：plugin 邏輯 |
| `workspace-tasks.types.ts` | `tasks-plugin.types.ts` | 揭示：plugin 型別 |
| `app/…/_components/` | `app/…/_route-components/` | 路由私有元件（非共享） |
| `app/…/_lib/` | `app/…/_route-utils/` | 路由私有工具函式 |
| `app/…/_events/` | `app/…/_event-handlers/` | 事件處理器（複數清楚） |
| `(auth)/` | `(auth-routes)/` | Route Group 揭示用途 |
| `@capability/capabilities/` | `@plugin-tab/plugin-settings/` | 消除自我指涉的混淆名稱 |
| `capabilities/capabilities/` | `plugins/plugin-settings/` | 消除自我指涉的混淆名稱 |

---

## 哪些地方不需要改？

- **`src/app/dashboard/account/`** 下的路由段（`audit/`, `daily/`, `matrix/`, `members/`, `partners/`, `schedule/`, `settings/`, `teams/`）：這些是領域名稱，已經清楚揭示內容，且都是薄 RSC 包裝器。
- **`src/styles/`**：名稱已明確。
- **`src/shared/utils/`**：名稱已明確。
- **`@modal/`、`@panel/`** parallel slots：名稱已揭示技術責任。
- **`daily-log/[logId]/`、`schedule-proposal/`** 等規範路由：URL 路徑必須與實際功能一致，不需要改。
- **Firebase 子資料夾內部檔案命名**（`.adapter.ts`、`.client.ts`、`.facade.ts`）：命名模式已清楚揭示角色，保持不變。

---

## 完整改名後的檔案樹

```
src/
├── domain-types/                          ← was: types/
│   ├── domain.ts
│   └── README.md
│
├── styles/                                ← unchanged
│   └── globals.css
│
├── shared/
│   ├── shadcn-ui/                         ← was: shared/ui/
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button-group.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── empty.tsx
│   │   ├── field.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-group.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── item.tsx
│   │   ├── kbd.tsx
│   │   ├── label.tsx
│   │   ├── language-switcher.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── spinner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── timeline.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   └── tooltip.tsx
│   │
│   ├── app-providers/                     ← was: shared/context/
│   │   ├── auth-provider.tsx              ← was: auth-context.tsx
│   │   ├── firebase-provider.tsx          ← was: firebase-context.tsx
│   │   ├── i18n-provider.tsx              ← was: i18n-context.tsx
│   │   └── theme-provider.tsx             ← was: theme-context.tsx
│   │
│   ├── utility-hooks/                     ← was: shared/hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── i18n-types/                        ← was: shared/types/
│   │   ├── i18n.schema.ts
│   │   └── i18n.ts
│   │
│   └── utils/                             ← unchanged
│       ├── format-bytes.ts
│       ├── i18n.ts
│       └── utils.ts
│
├── firebase/                              ← was: infra/firebase/ (移除 infra/ 包裝)
│   ├── analytics/
│   │   ├── analytics.adapter.ts
│   │   └── analytics.client.ts
│   ├── auth/
│   │   ├── auth.adapter.ts
│   │   └── auth.client.ts
│   ├── firestore/
│   │   ├── repositories/
│   │   │   ├── account.repository.ts
│   │   │   ├── read.repository.ts
│   │   │   ├── workspace.repository.ts
│   │   │   └── index.ts
│   │   ├── firestore.client.ts
│   │   ├── firestore.converter.ts
│   │   ├── firestore.facade.ts
│   │   ├── firestore.read.adapter.ts
│   │   ├── firestore.utils.ts
│   │   └── firestore.write.adapter.ts
│   ├── messaging/
│   │   ├── messaging.adapter.ts
│   │   └── messaging.client.ts
│   ├── storage/
│   │   ├── storage.client.ts
│   │   ├── storage.facade.ts
│   │   ├── storage.read.adapter.ts
│   │   └── storage.write.adapter.ts
│   ├── app.client.ts
│   └── firebase.config.ts
│
├── domain-rules/                          ← was: entities/
│   ├── account/index.ts                   ← isOwner, setupOrganizationWithTeam
│   ├── schedule/index.ts                  ← canTransitionScheduleStatus
│   ├── user/index.ts                      ← getUserTeamIds
│   ├── workspace/index.ts                 ← filterVisibleWorkspaces
│   └── index.ts
│
├── server-commands/                       ← was: actions/
│   ├── account/index.ts
│   ├── auth/index.ts
│   ├── audit/index.ts
│   ├── bookmark/index.ts
│   ├── daily/index.ts
│   ├── files/index.ts
│   ├── issue/index.ts
│   ├── members/index.ts
│   ├── schedule/index.ts
│   ├── storage/index.ts
│   ├── task/index.ts
│   ├── user/index.ts
│   ├── workspace/index.ts
│   └── index.ts
│
├── react-hooks/                           ← was: hooks/
│   ├── command-hooks/                     ← was: hooks/actions/
│   │   ├── use-bookmark-commands.ts       ← was: use-bookmark-actions.ts
│   │   ├── use-daily-commands.ts          ← was: use-daily-actions.ts
│   │   └── use-schedule-commands.ts       ← was: use-schedule-actions.ts
│   ├── service-hooks/                     ← was: hooks/infra/
│   │   ├── use-logger.ts
│   │   └── use-storage.ts
│   └── state-hooks/                       ← was: hooks/state/
│       ├── use-account-management.ts
│       ├── use-account.ts
│       ├── use-app.ts
│       ├── use-user.ts
│       └── use-visible-workspaces.ts
│
├── react-providers/                       ← was: context/
│   ├── account-provider.tsx               ← was: account-context.tsx
│   ├── app-provider.tsx                   ← was: app-context.tsx
│   ├── workspace-provider.tsx             ← was: workspace-context.tsx
│   └── workspace-event-provider.tsx       ← was: workspace-event-context.tsx
│
├── use-cases/                             ← was: features/ 的 index.ts（Use-case 協調器，無 React）
│   ├── account/index.ts                   ← setupOrganizationWithTeam
│   ├── auth/index.ts                      ← completeRegistration
│   ├── members/index.ts
│   ├── partners/index.ts
│   ├── schedule/index.ts                  ← approveScheduleItem, rejectScheduleItem
│   ├── teams/index.ts
│   ├── user-settings/index.ts
│   ├── workspace/
│   │   ├── index.ts                       ← createWorkspaceWithCapabilities
│   │   └── event-bus/
│   │       ├── workspace-event-bus.ts
│   │       └── workspace-events.ts
│   ├── workspace-members/index.ts
│   └── index.ts
│
├── view-modules/                          ← was: features/ 的 *-view.tsx（Client 視圖元件）
│   ├── account/
│   │   └── permission-matrix-view.tsx
│   ├── audit/
│   │   └── audit-view.tsx
│   ├── auth/
│   │   └── login-view.tsx
│   ├── dashboard/
│   │   └── dashboard-view.tsx
│   ├── files/
│   │   └── files-view.tsx
│   ├── finance/
│   │   └── finance-view.tsx
│   ├── members/
│   │   └── members-view.tsx
│   ├── partners/
│   │   ├── partner-detail-view.tsx
│   │   └── partners-view.tsx
│   ├── teams/
│   │   ├── team-detail-view.tsx
│   │   └── teams-view.tsx
│   ├── user-settings/
│   │   └── user-settings-view.tsx
│   └── workspace-members/
│       └── workspace-members-view.tsx
│
├── genkit-flows/                          ← was: ai/
│   ├── flows/
│   │   ├── adapt-ui-color-to-account-context.ts
│   │   └── extract-invoice-items.ts
│   ├── schemas/
│   │   └── docu-parse.ts
│   ├── dev.ts
│   └── genkit.ts
│
└── app/                                   ← Next.js App Router（純路由樹）
    ├── layout.tsx
    ├── page.tsx
    ├── favicon.ico
    │
    ├── (auth-routes)/                     ← was: (auth)/
    │   └── login/
    │       ├── _route-components/         ← was: _components/
    │       │   ├── auth-background.tsx
    │       │   ├── auth-tabs-root.tsx
    │       │   ├── login-form.tsx
    │       │   ├── register-form.tsx
    │       │   └── reset-password-dialog.tsx
    │       └── page.tsx
    │
    └── dashboard/
        ├── layout.tsx
        ├── page.tsx
        ├── _route-components/             ← was: _components/
        │   ├── layout/
        │   │   ├── global-search.tsx
        │   │   ├── header.tsx
        │   │   ├── notification-center.tsx
        │   │   └── theme-adapter.tsx
        │   ├── overview/
        │   │   ├── account-grid.tsx
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
        │       ├── account-create-dialog.tsx
        │       ├── account-switcher.tsx
        │       ├── index.tsx
        │       ├── nav-main.tsx
        │       ├── nav-user.tsx
        │       └── nav-workspaces.tsx
        │
        ├── account/                       ← unchanged（路由段已是領域名，薄 RSC 包裝器）
        │   ├── audit/page.tsx
        │   ├── daily/page.tsx
        │   ├── matrix/page.tsx
        │   ├── members/page.tsx
        │   ├── partners/
        │   │   ├── [id]/page.tsx
        │   │   └── page.tsx
        │   ├── schedule/page.tsx
        │   ├── settings/page.tsx
        │   └── teams/
        │       ├── [id]/page.tsx
        │       └── page.tsx
        │
        └── workspaces/
            ├── _route-components/         ← was: _components/
            │   ├── create-workspace-dialog.tsx
            │   ├── workspace-card.tsx
            │   ├── workspace-grid-view.tsx
            │   ├── workspace-list-header.tsx
            │   └── workspace-table-view.tsx
            ├── _route-utils/              ← was: _lib/
            │   ├── use-workspace-filters.ts
            │   └── workspace-actions.ts
            ├── page.tsx
            │
            └── [id]/
                ├── layout.tsx
                ├── page.tsx
                │
                ├── @plugin-tab/           ← was: @capability/（平行 slot：目前啟用的 plugin tab）
                │   ├── default.tsx
                │   ├── acceptance/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── audit/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── daily/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── document-parser/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── files/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── finance/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── issues/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── members/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── plugin-settings/   ← was: capabilities/（消除自我指涉）
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── qa/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   ├── schedule/
                │   │   ├── error.tsx
                │   │   ├── loading.tsx
                │   │   └── page.tsx
                │   └── tasks/
                │       ├── error.tsx
                │       ├── loading.tsx
                │       └── page.tsx
                │
                ├── @modal/                ← unchanged
                │   ├── default.tsx
                │   ├── (.)daily-log/
                │   │   └── [logId]/page.tsx
                │   └── (.)schedule-proposal/
                │       └── page.tsx
                │
                ├── @panel/                ← unchanged
                │   └── default.tsx
                │
                ├── _route-components/     ← was: _components/
                │   ├── workspace-nav-tabs.tsx
                │   ├── workspace-settings.tsx
                │   └── workspace-status-bar.tsx
                │
                ├── _event-handlers/       ← was: _events/
                │   └── workspace-event-handler.tsx
                │
                ├── plugins/               ← was: capabilities/（workspace plugin UI 實作）
                │   ├── acceptance/
                │   │   └── acceptance-plugin.tsx          ← was: workspace-acceptance.tsx
                │   │
                │   ├── audit/
                │   │   ├── _plugin-components/            ← was: _components/
                │   │   │   ├── audit-detail-sheet.tsx
                │   │   │   ├── audit-event-item.tsx
                │   │   │   ├── audit-timeline.tsx
                │   │   │   └── audit-type-icon.tsx
                │   │   ├── _plugin-hooks/                 ← was: _hooks/
                │   │   │   ├── use-account-audit.ts
                │   │   │   └── use-workspace-audit.ts
                │   │   ├── audit.account-view.tsx         ← was: audit.account.tsx
                │   │   ├── audit.view.tsx                 ← unchanged
                │   │   └── audit.workspace-view.tsx       ← was: audit.workspace.tsx
                │   │
                │   ├── daily/
                │   │   ├── _plugin-components/            ← was: _components/
                │   │   │   ├── actions/
                │   │   │   │   ├── bookmark-button.tsx
                │   │   │   │   ├── comment-button.tsx
                │   │   │   │   ├── like-button.tsx
                │   │   │   │   └── share-button.tsx
                │   │   │   ├── composer.tsx
                │   │   │   ├── daily-log-card.tsx
                │   │   │   ├── daily-log-dialog.tsx
                │   │   │   └── image-carousel.tsx
                │   │   ├── _plugin-hooks/                 ← was: _hooks/
                │   │   │   ├── use-aggregated-logs.ts
                │   │   │   ├── use-daily-upload.ts
                │   │   │   └── use-workspace-daily.ts
                │   │   ├── daily.account-view.tsx         ← was: daily.account.tsx
                │   │   ├── daily.view.tsx                 ← unchanged
                │   │   └── daily.workspace-view.tsx       ← was: daily.workspace.tsx
                │   │
                │   ├── document-parser/
                │   │   ├── document-parser-plugin.tsx     ← was: workspace-document-parser.component.tsx
                │   │   └── document-parser.server-commands.ts  ← was: actions.ts
                │   │
                │   ├── files/
                │   │   └── files-plugin.tsx               ← was: workspace-files.tsx
                │   │
                │   ├── finance/
                │   │   └── finance-plugin.tsx             ← was: workspace-finance.tsx
                │   │
                │   ├── issues/
                │   │   └── issues-plugin.tsx              ← was: workspace-issues.tsx
                │   │
                │   ├── members/
                │   │   ├── members-management-plugin.tsx  ← was: workspace-members-management.tsx
                │   │   └── members-plugin.tsx             ← was: workspace-members.tsx
                │   │
                │   ├── plugin-settings/
                │   │   └── plugin-settings.tsx            ← was: capabilities/workspace-capabilities.tsx
                │   │
                │   ├── qa/
                │   │   └── qa-plugin.tsx                  ← was: workspace-qa.tsx
                │   │
                │   ├── schedule/
                │   │   ├── _plugin-components/            ← was: _components/
                │   │   │   ├── decision-history-columns.tsx
                │   │   │   ├── governance-sidebar.tsx
                │   │   │   ├── proposal-dialog.tsx
                │   │   │   ├── schedule-data-table.tsx
                │   │   │   ├── unified-calendar-grid.tsx
                │   │   │   └── upcoming-events-columns.tsx
                │   │   ├── _plugin-hooks/                 ← was: _hooks/
                │   │   │   ├── use-global-schedule.ts
                │   │   │   └── use-workspace-schedule.ts
                │   │   ├── index.tsx
                │   │   ├── schedule.account-view.tsx      ← was: schedule.account.tsx
                │   │   ├── schedule.view.tsx              ← unchanged
                │   │   └── schedule.workspace-view.tsx    ← was: schedule.workspace.tsx
                │   │
                │   ├── tasks/
                │   │   ├── tasks-plugin.logic.ts          ← was: workspace-tasks.logic.ts
                │   │   ├── tasks-plugin.tsx               ← was: workspace-tasks.component.tsx
                │   │   └── tasks-plugin.types.ts          ← was: workspace-tasks.types.ts
                │   │
                │   └── index.ts
                │
                ├── daily-log/             ← unchanged（URL 路徑）
                │   └── [logId]/page.tsx
                │
                └── schedule-proposal/     ← unchanged（URL 路徑）
                    └── page.tsx
```

---

## import alias 對照（`tsconfig.json` / `components.json` 需同步更新）

| 現行 alias | 建議 alias |
|-----------|-----------|
| `@/types/` | `@/domain-types/` |
| `@/domain-rules/` | `@/domain-rules/` |
| `@/infra/` | `@/firebase/` |
| `@/server-commands/` | `@/server-commands/` |
| `@/hooks/` | `@/react-hooks/` |
| `@/context/` | `@/react-providers/` |
| `@/features/` | `@/use-cases/` 或 `@/view-modules/`（視導入對象） |
| `@/shared/shadcn-ui/` | `@/shared/shadcn-ui/` |
| `@/ai/` | `@/genkit-flows/` |

---

## 改動摘要

**高影響（folder 重命名，import alias 需全面更新）**
- `src/actions/` → `src/server-commands/`
- `src/entities/` → `src/domain-rules/`
- `src/features/` → 拆分為 `src/use-cases/`（協調器）+ `src/view-modules/`（視圖元件）
- `src/context/` → `src/react-providers/`
- `src/hooks/` → `src/react-hooks/`
- `src/infra/firebase/` → `src/firebase/`（移除 `infra/` 包裝）

**中影響（app/ 層結構調整）**
- `@capability/` → `@plugin-tab/`（同步更新 `layout.tsx` slot props 型別與 `useSelectedLayoutSegment('capability')` 參數）
- `capabilities/` → `plugins/`（工具函式與 UI 元件路徑更新）
- `_components/` → `_route-components/`（多處）

**低影響（個別檔案改名）**
- `*.workspace.tsx` → `*.workspace-view.tsx`（揭示 view 語意）
- `*.account.tsx` → `*.account-view.tsx`（揭示 view 語意）
- `workspace-{domain}.tsx` → `{domain}-plugin.tsx`（揭示 plugin 語意）
- `use-*-actions.ts` → `use-*-commands.ts`（hooks/command-hooks/ 下）

**不需要改**
- `src/app/dashboard/account/` 下的路由段（已是清楚的領域名）
- `@modal/`、`@panel/` slot 名
- Firebase 內部的 `.adapter.ts`、`.client.ts`、`.facade.ts` 後綴命名模式
- `daily-log/`、`schedule-proposal/` 規範路由（URL 路徑）
