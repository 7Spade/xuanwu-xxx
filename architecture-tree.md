🏗️ 重構結構樹：高內聚四層架構
Core → Governance → Business → Projection（一核兩視圖）

📐 架構設計理念
Account = User（個人）+ Organization（組織）
Workspace = 屬於 Account 的業務執行單元

四層劃分：
┌─────────────┬──────────────────────────────────────┐
│ Core        │ 基礎設施、認證、Firebase、共用 UI      │
│ Governance  │ 帳號治理、權限、成員、稽核              │
│ Business    │ 實際業務邏輯（tasks/daily/finance...） │
│ Projection  │ 一個核心資料 → Account視圖 + WS視圖   │
└─────────────┴──────────────────────────────────────┘


🌳 完整結構樹
src/
│
├── 📦 core/                          # [CORE] 基礎設施層
│   ├── infra/
│   │   └── firebase/
│   │       ├── app.client.ts
│   │       ├── firebase.config.ts
│   │       ├── auth/
│   │       │   ├── auth.client.ts
│   │       │   └── auth.adapter.ts
│   │       ├── firestore/
│   │       │   ├── firestore.client.ts
│   │       │   ├── firestore.converter.ts
│   │       │   ├── firestore.facade.ts
│   │       │   ├── firestore.read.adapter.ts
│   │       │   ├── firestore.write.adapter.ts
│   │       │   └── firestore.utils.ts
│   │       ├── storage/
│   │       │   ├── storage.client.ts
│   │       │   ├── storage.facade.ts
│   │       │   ├── storage.read.adapter.ts
│   │       │   └── storage.write.adapter.ts
│   │       ├── messaging/
│   │       │   ├── messaging.client.ts
│   │       │   └── messaging.adapter.ts
│   │       └── analytics/
│   │           ├── analytics.client.ts
│   │           └── analytics.adapter.ts
│   │
│   ├── context/                      # 全域 Context
│   │   ├── auth-context.tsx
│   │   ├── app-context.tsx
│   │   ├── firebase-context.tsx
│   │   ├── theme-context.tsx
│   │   └── i18n-context.tsx
│   │
│   ├── hooks/                        # 純基礎 Hooks
│   │   ├── use-logger.ts
│   │   ├── use-storage.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── format.ts
│   │   └── i18n.ts
│   │
│   ├── types/
│   │   ├── domain.ts
│   │   ├── i18n.ts
│   │   └── i18n.schema.ts
│   │
│   └── ui/                           # shadcn/ui 元件（僅此一處）
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── alert-dialog.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── button-group.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── command.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── empty.tsx
│       ├── field.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── input-group.tsx
│       ├── input-otp.tsx
│       ├── item.tsx
│       ├── kbd.tsx
│       ├── label.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── spinner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── timeline.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle.tsx
│       ├── toggle-group.tsx
│       └── tooltip.tsx
│
├── 🏛️ governance/                    # [GOVERNANCE] 治理層
│   │                                 # 帳號/成員/權限/稽核/設定
│   ├── account/                      # Account = User + Organization
│   │   ├── context/
│   │   │   ├── account-context.tsx   # 當前 account 狀態
│   │   │   └── workspace-context.tsx # workspace 清單狀態
│   │   │
│   │   ├── repositories/             # Firestore 存取層
│   │   │   ├── account.repository.ts
│   │   │   └── workspace.repository.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-account.ts
│   │   │   ├── use-account-management.ts
│   │   │   └── use-visible-workspaces.ts
│   │   │
│   │   ├── members/                  # 成員管理（Organization 維度）
│   │   │   ├── members.service.ts
│   │   │   ├── members.repository.ts
│   │   │   └── hooks/
│   │   │       └── use-members.ts
│   │   │
│   │   ├── teams/                    # 團隊管理
│   │   │   ├── teams.service.ts
│   │   │   ├── teams.repository.ts
│   │   │   └── hooks/
│   │   │       └── use-teams.ts
│   │   │
│   │   ├── partners/                 # 合作夥伴
│   │   │   ├── partners.service.ts
│   │   │   ├── partners.repository.ts
│   │   │   └── hooks/
│   │   │       └── use-partners.ts
│   │   │
│   │   ├── audit/                    # 稽核（Account 維度）
│   │   │   ├── audit.service.ts
│   │   │   ├── audit.repository.ts
│   │   │   └── hooks/
│   │   │       └── use-account-audit.ts
│   │   │
│   │   └── settings/                 # 帳號設定
│   │       ├── settings.service.ts
│   │       └── hooks/
│   │           └── use-account-settings.ts
│   │
│   └── workspace/                    # Workspace 治理
│       ├── workspace.service.ts
│       ├── workspace-actions.ts
│       │
│       ├── members/                  # WS 成員管理
│       │   ├── ws-members.service.ts
│       │   └── hooks/
│       │       └── use-workspace-members.ts
│       │
│       └── audit/                    # 稽核（Workspace 維度）
│           ├── ws-audit.service.ts
│           └── hooks/
│               └── use-workspace-audit.ts
│
├── 💼 business/                      # [BUSINESS] 業務邏輯層
│   │                                 # 純邏輯，不含任何視圖
│   │
│   ├── daily/                        # 日誌模組
│   │   ├── daily.service.ts
│   │   ├── daily.repository.ts
│   │   ├── daily.types.ts
│   │   └── hooks/
│   │       ├── use-daily-actions.ts
│   │       ├── use-daily-upload.ts
│   │       └── use-aggregated-logs.ts
│   │
│   ├── schedule/                     # 行程/決策模組
│   │   ├── schedule.service.ts
│   │   ├── schedule.repository.ts
│   │   ├── schedule.types.ts
│   │   └── hooks/
│   │       ├── use-schedule-actions.ts
│   │       └── use-global-schedule.ts
│   │
│   ├── tasks/                        # 任務模組
│   │   ├── tasks.service.ts
│   │   ├── tasks.repository.ts
│   │   ├── tasks.types.ts
│   │   └── hooks/
│   │       └── use-tasks.ts
│   │
│   ├── finance/                      # 財務模組
│   │   ├── finance.service.ts
│   │   ├── finance.repository.ts
│   │   ├── finance.types.ts
│   │   └── hooks/
│   │       └── use-finance.ts
│   │
│   ├── files/                        # 檔案模組
│   │   ├── files.service.ts
│   │   ├── files.repository.ts
│   │   └── hooks/
│   │       └── use-files.ts
│   │
│   ├── issues/                       # 問題追蹤
│   │   ├── issues.service.ts
│   │   ├── issues.repository.ts
│   │   └── hooks/
│   │       └── use-issues.ts
│   │
│   ├── qa/                           # QA 模組
│   │   ├── qa.service.ts
│   │   ├── qa.repository.ts
│   │   └── hooks/
│   │       └── use-qa.ts
│   │
│   ├── bookmarks/                    # 書籤互動
│   │   ├── bookmarks.service.ts
│   │   └── hooks/
│   │       └── use-bookmark-actions.ts
│   │
│   └── document-parser/              # AI 文件解析 (Genkit)
│       ├── parser.service.ts
│       ├── parser.actions.ts         # Server Actions
│       └── hooks/
│           └── use-document-parser.ts
│
├── 🤖 ai/                            # [AI / GENKIT] AI 層
│   ├── genkit.ts                     # Genkit 初始化
│   ├── dev.ts
│   │
│   ├── flows/
│   │   ├── extract-invoice-items.ts
│   │   ├── adapt-ui-color-to-account-context.ts
│   │   └── _index.ts
│   │
│   └── schemas/
│       └── docu-parse.ts
│
└── app/                              # [PROJECTION] Next.js App Router
    │                                 # 純視圖層，只組合 business/ + governance/
    ├── layout.tsx
    ├── page.tsx
    ├── globals.css
    │
    ├── (auth)/                       # 認證流程
    │   └── login/
    │       ├── page.tsx
    │       └── _components/
    │           ├── auth-background.tsx
    │           ├── auth-tabs-root.tsx
    │           ├── login-form.tsx
    │           ├── register-form.tsx
    │           └── reset-password-dialog.tsx
    │
    └── dashboard/
        ├── layout.tsx                # Dashboard Shell（Sidebar + Header）
        ├── page.tsx                  # Overview
        │
        ├── _components/             # Dashboard 共用 UI
        │   ├── layout/
        │   │   ├── header.tsx
        │   │   ├── global-search.tsx
        │   │   ├── notification-center.tsx
        │   │   └── theme-adapter.tsx
        │   ├── overview/
        │   │   ├── account-grid.tsx
        │   │   ├── stat-cards.tsx
        │   │   ├── workspace-list.tsx
        │   │   └── permission-tree.tsx
        │   ├── settings/
        │   │   ├── index.tsx
        │   │   ├── profile-card.tsx
        │   │   ├── preferences-card.tsx
        │   │   ├── security-card.tsx
        │   │   └── user-settings-overlay.tsx
        │   └── sidebar/
        │       ├── index.tsx
        │       ├── nav-main.tsx
        │       ├── nav-user.tsx
        │       ├── nav-workspaces.tsx
        │       ├── account-switcher.tsx
        │       └── account-create-dialog.tsx
        │
        ├── account/                  # 🔵 PROJECTION：Account 視圖
        │   │                         # 消費 governance/ + business/ 的 Account 維度
        │   ├── layout.tsx
        │   │
        │   ├── @overview/            # ── 平行路由 Slot ──
        │   │   └── default.tsx
        │   ├── @governance/          # 平行路由：治理面板
        │   │   └── default.tsx
        │   │
        │   ├── members/
        │   │   └── page.tsx          # → governance/account/members
        │   ├── teams/
        │   │   ├── page.tsx
        │   │   └── [id]/
        │   │       └── page.tsx
        │   ├── partners/
        │   │   ├── page.tsx
        │   │   └── [id]/
        │   │       └── page.tsx
        │   ├── audit/
        │   │   └── page.tsx          # → governance/account/audit
        │   ├── schedule/
        │   │   └── page.tsx          # → business/schedule (account scope)
        │   ├── daily/
        │   │   └── page.tsx          # → business/daily (account scope)
        │   ├── matrix/
        │   │   └── page.tsx
        │   └── settings/
        │       └── page.tsx
        │
        └── workspaces/               # 🟢 PROJECTION：Workspace 視圖
            │                         # 消費 governance/ + business/ 的 WS 維度
            ├── page.tsx              # Workspace 列表
            │
            ├── _components/          # WS 列表 UI
            │   ├── workspace-card.tsx
            │   ├── workspace-grid-view.tsx
            │   ├── workspace-table-view.tsx
            │   ├── workspace-list-header.tsx
            │   └── create-workspace-dialog.tsx
            │
            ├── _lib/
            │   └── use-workspace-filters.ts
            │
            └── [id]/                 # 單一 Workspace
                ├── layout.tsx        # WS Shell（Tabs + StatusBar）
                ├── page.tsx          # WS Overview
                │
                ├── _components/
                │   ├── workspace-tabs.tsx
                │   ├── workspace-status-bar.tsx
                │   └── workspace-settings.tsx
                │
                ├── _events/          # WS 事件匯流排
                │   ├── workspace-event-bus.ts
                │   ├── workspace-events.ts
                │   └── workspace-event-handler.tsx
                │
                │   # ── 平行路由（一核兩視圖的 WS 內部實現）──
                ├── @main/            # 主內容 Slot
                │   └── default.tsx
                ├── @sidebar/         # 側邊工具列 Slot
                │   └── default.tsx
                │
                │   # ── Workspace Capabilities（對應 business/ 模組）──
                ├── daily/
                │   ├── page.tsx
                │   └── _view/        # WS 維度的 daily 視圖元件
                │       ├── daily.workspace.tsx
                │       ├── composer.tsx
                │       ├── daily-log-card.tsx
                │       ├── daily-log-dialog.tsx
                │       ├── image-carousel.tsx
                │       └── actions/
                │           ├── like-button.tsx
                │           ├── comment-button.tsx
                │           ├── bookmark-button.tsx
                │           └── share-button.tsx
                ├── schedule/
                │   ├── page.tsx
                │   └── _view/
                │       ├── schedule.workspace.tsx
                │       ├── unified-calendar-grid.tsx
                │       ├── governance-sidebar.tsx
                │       ├── proposal-dialog.tsx
                │       ├── schedule-data-table.tsx
                │       ├── upcoming-events-columns.tsx
                │       └── decision-history-columns.tsx
                ├── tasks/
                │   ├── page.tsx
                │   └── _view/
                │       └── workspace-tasks.tsx
                ├── finance/
                │   ├── page.tsx
                │   └── _view/
                │       └── workspace-finance.tsx
                ├── files/
                │   ├── page.tsx
                │   └── _view/
                │       └── workspace-files.tsx
                ├── issues/
                │   ├── page.tsx
                │   └── _view/
                │       └── workspace-issues.tsx
                ├── qa/
                │   ├── page.tsx
                │   └── _view/
                │       └── workspace-qa.tsx
                ├── audit/
                │   ├── page.tsx
                │   └── _view/
                │       ├── audit.workspace.tsx
                │       ├── audit-timeline.tsx
                │       ├── audit-event-item.tsx
                │       ├── audit-detail-sheet.tsx
                │       └── audit-type-icon.tsx
                ├── members/
                │   ├── page.tsx
                │   └── _view/
                │       ├── workspace-members.tsx
                │       └── workspace-members-management.tsx
                ├── document-parser/
                │   ├── page.tsx
                │   └── _view/
                │       └── workspace-document-parser.tsx
                ├── acceptance/
                │   ├── page.tsx
                │   └── _view/
                │       └── workspace-acceptance.tsx
                └── capabilities/
                    ├── page.tsx
                    └── _view/
                        └── workspace-capabilities.tsx


🧭 四層依賴流向圖
┌─────────────────────────────────────────────────────┐
│                  app/ (Projection)                  │
│         account/視圖  ←→  workspaces/視圖            │
│           平行路由 @slot  +  [id]/@slot              │
└───────────────────┬─────────────────────────────────┘
                    │ 只消費，不含邏輯
          ┌─────────┴──────────┐
          ▼                    ▼
┌──────────────────┐  ┌─────────────────────┐
│  governance/     │  │     business/        │
│  account/        │  │  daily / schedule    │
│  workspace/      │  │  tasks / finance     │
│  members/audit   │  │  files / issues / qa │
└─────────┬────────┘  └──────────┬───────────┘
          └──────────┬───────────┘
                     │ 共用
                     ▼
          ┌─────────────────────┐
          │       core/         │
          │  firebase / ui /    │
          │  hooks / lib / types│
          └─────────────────────┘


💡 關鍵設計原則說明
原則
說明
一核兩視圖
business/daily 是核心，account/daily/page.tsx 與 workspaces/[id]/daily/page.tsx 是兩個 Projection
_view/ 資料夾
WS 內每個 capability 的視圖元件放 _view/，與路由 page.tsx 分離
平行路由
Dashboard 層用 @overview/@governance，WS 層用 @main/@sidebar
business/ 無視圖
純 service + repository + hooks，完全不含 JSX
governance/ 不含業務
只管權限、成員、稽核、設定，不碰 daily/tasks/finance
core/ui 唯一 UI 來源
所有 shadcn 元件只在 core/ui/ 一個地方，不重複散落
