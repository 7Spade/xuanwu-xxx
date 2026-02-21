# Structure Overview

> 本文件描述專案的完整目錄結構與檔案清單。
> 架構原則、依賴規則與資料流模式請參閱 [architecture-overview.md](./architecture-overview.md)。

---

## 根目錄

```
/
├── src/                        ← 所有應用程式原始碼
├── functions/                  ← Firebase Cloud Functions（Node.js workspace）
├── public/                     ← 靜態資源
├── docs/                       ← 額外文件（events.md 等）
├── next.config.ts              ← Next.js 設定（@/ path alias）
├── tailwind.config.ts          ← Tailwind CSS 設定
├── tsconfig.json               ← TypeScript 設定（strict mode）
├── eslint.config.mts           ← ESLint flat config（7 plugins + 11 layer rules）
├── firebase.json               ← Firebase 部署設定
├── firestore.rules             ← Firestore 安全規則
├── firestore.indexes.json      ← Firestore 複合索引
├── storage.rules               ← Firebase Storage 安全規則
├── apphosting.yaml             ← Firebase App Hosting 設定
├── components.json             ← Shadcn/UI CLI 設定
├── repomix.config.ts           ← Repomix 設定（排除生成檔案）
├── architecture-overview.md    ← 架構說明（本文的姐妹文件）
└── structure-overview.md       ← 結構說明（本文件）
```

---

## `src/` 頂層結構

```
src/
├── app/                 ← Next.js App Router（路由組裝層）
├── domain-types/        ← TypeScript 型別定義（無邏輯）
├── domain-rules/        ← 純業務規則（無 I/O，無框架）
├── firebase/            ← Firebase SDK 唯一閘道
├── genkit-flows/        ← Google Genkit AI 流程
├── react-hooks/         ← React Hooks（狀態、指令、服務）
├── react-providers/     ← React Context Providers
├── server-commands/     ← Firebase 操作封裝（Server Actions）
├── shared/              ← 跨層工具、UI primitives、常數
├── styles/              ← 全域 CSS
├── use-cases/           ← 應用層編排（多步驟工作流）
└── view-modules/        ← 功能 UI 模組
```

---

## `src/domain-types/` — 型別定義層

每個 domain 一個子目錄，命名模式：`{domain}/{domain}.types.ts` + `index.ts` barrel。

```
domain-types/
├── domain.ts                    ← 向下相容的 re-export barrel（舊版 import 路徑保留）
├── index.ts                     ← 頂層 re-export barrel（@/domain-types alias）
├── account/
│   ├── account.types.ts         ← Account, AccountType, MemberReference, Team,
│   │                               ThemeConfig, ExpertiseBadge, Notification, PartnerInvite
│   └── index.ts
├── workspace/
│   ├── workspace.types.ts       ← Workspace, WorkspaceGrant, Capability, CapabilitySpec,
│   │                               WorkspaceTask, WorkspaceIssue, WorkspaceFile, Location, Address
│   └── index.ts
├── schedule/
│   ├── schedule.types.ts        ← ScheduleItem, ScheduleStatus
│   └── index.ts
├── task/
│   ├── task.types.ts            ← TaskWithChildren
│   └── index.ts
├── daily/
│   ├── daily.types.ts           ← DailyLog, DailyLogComment
│   └── index.ts
└── audit/
    ├── audit.types.ts           ← AuditLog
    └── index.ts
```

---

## `src/domain-rules/` — 業務規則層

純函式，無 I/O，每個 domain 一個子目錄。

```
domain-rules/
├── account/
│   ├── account.rules.ts         ← isOrganization, isOwner, getUserTeamIds, getMemberRole
│   └── index.ts
├── workspace/
│   ├── workspace.rules.ts       ← filterVisibleWorkspaces, hasWorkspaceAccess
│   └── index.ts
├── schedule/
│   ├── schedule.rules.ts        ← canTransitionScheduleStatus, VALID_STATUS_TRANSITIONS
│   └── index.ts
├── task/
│   ├── task.rules.ts            ← buildTaskTree
│   └── index.ts
└── user/
    ├── user.rules.ts            ← isAnonymousUser
    └── index.ts
```

---

## `src/firebase/` — Firebase 閘道層

Facade + Repository Pattern，`firestore.facade.ts` 為統一出口。

```
firebase/
├── app.client.ts                ← Firebase App singleton 初始化
├── firebase.config.ts           ← 憑證（從環境變數讀取）
├── auth/
│   ├── auth.client.ts           ← Firebase Auth 實例
│   └── auth.adapter.ts          ← Auth 操作封裝（signIn, register, signOut...）
├── analytics/
│   ├── analytics.client.ts
│   └── analytics.adapter.ts
├── messaging/
│   ├── messaging.client.ts
│   └── messaging.adapter.ts
├── storage/
│   ├── storage.client.ts        ← Firebase Storage 實例
│   ├── storage.facade.ts        ← Storage 統一出口
│   ├── storage.read.adapter.ts
│   └── storage.write.adapter.ts
└── firestore/
    ├── firestore.client.ts      ← Firestore 實例
    ├── firestore.facade.ts      ← 統一出口：彙整所有 repository re-export
    ├── firestore.converter.ts   ← TypeScript 型別化資料轉換器
    ├── firestore.read.adapter.ts← 泛型讀取工具（getDocument, getDocuments）
    ├── firestore.write.adapter.ts← 泛型寫入工具（setDocument, updateDocument...）
    ├── firestore.utils.ts       ← 純 Firestore 工具函式
    └── repositories/
        ├── index.ts             ← barrel re-export
        ├── account.repository.ts← 組織、成員、團隊操作
        ├── user.repository.ts   ← 使用者個人資料、書籤
        ├── workspace.repository.ts← 工作區、任務、議題、檔案、授權
        ├── schedule.repository.ts← 排程項目 CRUD + 讀取
        ├── daily.repository.ts  ← 每日日誌寫入 + 讀取
        └── audit.repository.ts  ← 稽核日誌讀取
```

---

## `src/genkit-flows/` — AI 流程層

```
genkit-flows/
├── genkit.ts                    ← 中央 Genkit ai 實例設定
└── flows/
    └── *.flow.ts                ← 各 AI flow 定義（文件解析等）
```

---

## `src/server-commands/` — 伺服器指令層

每個 domain 一個子目錄，命名模式：`{domain}/{domain}.commands.ts` + `index.ts` barrel。

```
server-commands/
├── account/
│   └── account.commands.ts      ← 組織 CRUD、成員、團隊管理
├── auth/
│   └── auth.commands.ts         ← signIn, registerUser, signOut, sendPasswordResetEmail
├── workspace/
│   └── workspace.commands.ts    ← 工作區生命週期、授權、能力掛載
├── schedule/
│   └── schedule.commands.ts     ← 排程項目 CRUD、成員指派
├── daily/
│   └── daily.commands.ts        ← 每日日誌、按讚、留言
├── task/
│   └── task.commands.ts         ← 任務 CRUD、批次匯入
├── audit/
│   └── audit.commands.ts        ← 稽核事件寫入
├── issue/
│   └── issue.commands.ts        ← 議題 CRUD、留言
├── members/
│   └── members.commands.ts      ← 工作區成員查詢
├── bookmark/
│   └── bookmark.commands.ts     ← 書籤切換
├── storage/
│   └── storage.commands.ts      ← 檔案上傳（圖片、附件、頭像）
├── files/
│   └── files.commands.ts        ← 檔案清單取得
├── user/
│   └── user.commands.ts         ← 使用者帳號建立、個人資料管理
└── document-parser/
    └── document-parser.commands.ts← AI 文件解析（呼叫 genkit-flows）
```

---

## `src/use-cases/` — 應用層編排

```
use-cases/
├── index.ts                     ← barrel（authFeatures, workspaceFeatures, accountFeatures）
├── auth/
│   └── auth.use-cases.ts        ← completeRegistration（Auth + Firestore 雙寫）
├── account/
│   └── account.use-cases.ts     ← setupOrganizationWithTeam
└── workspace/
    ├── workspace.use-cases.ts   ← createWorkspaceWithCapabilities
    ├── workspace-actions.ts     ← React 端封裝（含 toast）
    └── event-bus/
        ├── workspace-event-bus.ts    ← EventEmitter 實作
        └── workspace-events.ts      ← 事件型別定義（workspace:tasks:completed 等）
```

---

## `src/react-providers/` — Context 層

```
react-providers/
├── app-provider.tsx             ← AppContext（activeAccount, accounts, notifications,
│                                   capabilitySpecs, scheduleTaskRequest）
├── account-provider.tsx         ← AccountContext（workspaces, members, schedule_items,
│                                   daily_logs, audit_logs）— Firestore 實時監聽
├── workspace-provider.tsx       ← WorkspaceContext（單一 workspace 詳細狀態）
│                                   — Firestore 實時監聽任務、議題、檔案等
└── workspace-event-context.ts   ← WorkspaceEventBus Context 型別定義
```

**Provider 掛載層級：**
```
src/app/layout.tsx
  └── FirebaseProvider (shared/app-providers)
      └── AuthProvider (shared/app-providers)
          └── AppProvider (react-providers)
              └── src/app/dashboard/layout.tsx
                  └── AccountProvider (react-providers)
                      └── WorkspaceProvider (react-providers)  ← 工作區頁面
```

---

## `src/react-hooks/` — Hooks 層

```
react-hooks/
├── state-hooks/                 ← 讀取 Context 狀態（無副作用）
│   ├── use-app.ts               ← 讀取 AppContext
│   ├── use-account.ts           ← 讀取 AccountContext
│   ├── use-user.ts              ← 讀取 AuthContext（當前用戶資料）
│   ├── use-account-management.ts← 組織管理操作封裝
│   ├── use-account-audit.ts     ← 帳號層稽核日誌（Firestore 實時）
│   ├── use-workspace-audit.ts   ← 工作區稽核日誌（Firestore 實時）
│   ├── use-workspace-daily.ts   ← 工作區每日日誌狀態
│   ├── use-workspace-filters.ts ← 工作區篩選狀態
│   ├── use-workspace-schedule.ts← 工作區排程狀態與導航
│   ├── use-global-schedule.ts   ← 帳號層排程資料彙整與派生
│   ├── use-visible-workspaces.ts← 根據權限篩選可見工作區
│   └── use-aggregated-logs.ts   ← 跨工作區日誌彙整
├── command-hooks/               ← 封裝寫入操作（含 auth guard、toast、useCallback）
│   ├── use-schedule-commands.ts ← approve/reject/assign/unassign 排程項目
│   ├── use-workspace-commands.ts← deleteWorkspace
│   ├── use-daily-commands.ts    ← toggleLike、addComment
│   ├── use-bookmark-commands.ts ← 書籤切換
│   └── use-workspace-event-handler.tsx ← 工作區跨插件事件匯流排訂閱者
└── service-hooks/               ← 封裝基礎設施服務
    ├── use-logger.ts            ← 稽核日誌寫入
    ├── use-storage.ts           ← Firebase Storage 上傳
    └── use-daily-upload.ts      ← 每日日誌圖片上傳
```

---

## `src/view-modules/` — UI 模組層

```
view-modules/
├── auth/
│   ├── login-view.tsx           ← 登入頁面（含註冊 Tab）
│   └── reset-password-form.tsx  ← 重設密碼表單
├── dashboard/
│   ├── layout/
│   │   ├── header.tsx           ← Header（SidebarTrigger + Breadcrumb）
│   │   └── theme-adapter.tsx    ← 組織主題動態套用
│   ├── sidebar/
│   │   ├── index.tsx            ← DashboardSidebar（含 SidebarRail）
│   │   ├── account-switcher.tsx ← 帳號切換器（DropdownMenu）
│   │   ├── nav-main.tsx         ← 主導航項目
│   │   └── nav-user.tsx         ← 使用者選單
│   └── account-new-form.tsx     ← 新建組織/帳號表單
├── workspaces/
│   ├── workspaces-view.tsx      ← 工作區列表頁
│   ├── workspace-card.tsx       ← 工作區卡片元件
│   ├── workspace-nav-tabs.tsx   ← 工作區插件 Tab 導航
│   ├── workspace-settings.tsx   ← 工作區設定表單
│   ├── workspace-status-bar.tsx ← 工作區狀態列
│   ├── create-workspace-dialog.tsx← 新建工作區 Dialog
│   └── plugins/
│       ├── index.ts             ← 插件 barrel（所有插件 export）
│       ├── acceptance/          ← 驗收插件
│       ├── audit/               ← 稽核插件（workspace + account 雙檢視）
│       ├── daily/               ← 每日日誌插件（workspace + account 雙檢視）
│       ├── document-parser/     ← AI 文件解析插件
│       ├── files/               ← 檔案管理插件
│       ├── finance/             ← 財務插件
│       ├── issues/              ← 議題管理插件
│       ├── members/             ← 成員管理插件
│       ├── plugin-settings/     ← 能力設定插件
│       ├── qa/                  ← QA 品質把關插件
│       └── tasks/               ← 任務管理插件
│       (schedule 已提升為頂層模組，見下方 schedule/)
├── schedule/                    ← 一核兩視圖頂層模組（跨 account + workspace）
│   ├── index.ts                 ← 統一出口
│   ├── schedule.account-view.tsx   ← Account 視角（全域日曆 + 治理審核 + 人力指派）
│   ├── schedule.workspace-view.tsx ← Workspace 視角（工作區日曆 + 排程提案入口）
│   └── _components/             ← 兩視角共用的私有子元件
│       ├── unified-calendar-grid.tsx
│       ├── governance-sidebar.tsx
│       ├── proposal-dialog.tsx
│       ├── schedule-proposal-content.tsx ← 排程提案共用邏輯元件
│       ├── schedule-data-table.tsx
│       ├── decision-history-columns.tsx
│       └── upcoming-events-columns.tsx
├── user-settings/
│   ├── user-settings.tsx        ← 使用者設定主頁
│   └── profile-card.tsx         ← 個人資料卡
├── members/
│   └── members-view.tsx         ← 組織成員管理頁
├── partners/
│   ├── partners-view.tsx        ← 外部合作方列表
│   └── partner-detail-view.tsx  ← 合作方詳情
├── teams/
│   ├── teams-view.tsx           ← 團隊列表
│   └── team-detail-view.tsx     ← 團隊詳情
└── account/
    └── permission-matrix-view.tsx← 權限矩陣頁
```

---

## `src/app/` — Next.js App Router 路由層

```
app/
├── layout.tsx                   ← 根佈局（FirebaseProvider, AuthProvider, AppProvider 掛載）
├── page.tsx                     ← 根頁（重定向至 /login 或 /dashboard）
│
├── (auth-routes)/               ← 路由群組（不影響 URL 路徑）
│   ├── layout.tsx               ← 認證頁佈局
│   ├── @modal/                  ← Parallel Route slot
│   │   ├── (.)reset-password/   ← Intercepting Route → ResetPassword Dialog
│   │   └── default.tsx
│   ├── login/
│   │   └── page.tsx             ← 登入/註冊頁（LoginView）
│   └── reset-password/
│       └── page.tsx             ← 重設密碼頁（canonical）
│
└── dashboard/
    ├── layout.tsx               ← Auth Guard + AccountProvider + SidebarProvider
    ├── page.tsx                 ← Dashboard 首頁（重定向至 /workspaces）
    ├── @sidebar/
    │   └── default.tsx          ← DashboardSidebar
    ├── @header/
    │   └── default.tsx          ← Header（SidebarTrigger + Breadcrumb）
    ├── @modal/
    │   ├── (.)account/new/      ← 新建帳號 Dialog
    │   └── default.tsx
    │
    ├── account/                 ← 帳號層功能頁
    │   ├── new/                 ← 新建組織頁
    │   ├── members/             ← 成員管理頁
    │   ├── teams/               ← 團隊列表頁
    │   │   └── [id]/            ← 團隊詳情頁
    │   ├── partners/            ← 合作方列表頁
    │   │   └── [id]/            ← 合作方詳情頁
    │   ├── settings/            ← 帳號設定頁
    │   ├── matrix/              ← 權限矩陣頁
    │   ├── schedule/            ← 組織排程管理頁（AccountScheduleSection）
    │   ├── daily/               ← 組織每日日誌頁
    │   └── audit/               ← 組織稽核日誌頁
    │
    └── workspaces/              ← 工作區功能頁
        ├── layout.tsx           ← 工作區列表佈局
        ├── page.tsx             ← 工作區列表頁（WorkspacesView）
        ├── new/                 ← 新建工作區頁（canonical）
        ├── @modal/              ← Parallel Route slot
        │   ├── (.)new/          ← 新建工作區 Dialog（Intercepting）
        │   └── default.tsx
        │
        └── [id]/                ← 單一工作區詳情頁
            ├── layout.tsx       ← WorkspaceProvider + 工作區 Header + NavTabs
            ├── page.tsx         ← 工作區首頁（重定向至預設插件）
            ├── settings/        ← 工作區設定頁（canonical）
            ├── governance/      ← 治理審核頁（canonical）
            ├── schedule-proposal/← 排程提案頁（canonical）
            ├── daily-log/[logId]/← 日誌詳情頁（canonical）
            │
            ├── @plugin-tab/     ← Parallel Route slot（工作區插件 Tab 內容）
            │   ├── default.tsx  ← 預設空白頁
            │   ├── loading.tsx  ← Skeleton 骨架屏
            │   ├── error.tsx    ← 錯誤邊界
            │   ├── acceptance/  ← 驗收插件頁
            │   ├── audit/       ← 稽核插件頁
            │   ├── capabilities/← 能力設定插件頁
            │   ├── daily/       ← 每日日誌插件頁
            │   ├── document-parser/← 文件解析插件頁
            │   ├── files/       ← 檔案管理插件頁
            │   ├── finance/     ← 財務插件頁
            │   ├── issues/      ← 議題管理插件頁
            │   ├── members/     ← 成員管理插件頁
            │   ├── qa/          ← QA 插件頁
            │   ├── schedule/    ← 排程插件頁
            │   └── tasks/       ← 任務管理插件頁
            │
            ├── @modal/          ← Parallel Route slot（Dialog 攔截）
            │   ├── (.)settings/ ← 工作區設定 Dialog
            │   ├── (.)schedule-proposal/← 排程提案 Dialog
            │   ├── (.)daily-log/[logId]/← 日誌詳情 Dialog
            │   └── default.tsx
            │
            └── @panel/          ← Parallel Route slot（右側面板攔截）
                ├── (.)governance/← 治理審核面板（Sheet）
                └── default.tsx
```

---

## `src/shared/` — 跨層工具層

```
shared/
├── FLOWS.md                     ← 4 種規範資料流時序圖（A-D）
├── app-providers/               ← 基礎設施 React Providers
│   ├── firebase-provider.tsx    ← Firebase App 實例注入
│   ├── auth-provider.tsx        ← Firebase Auth 狀態監聽
│   ├── theme-provider.tsx       ← next-themes 暗色模式
│   └── i18n-provider.tsx        ← 國際化 Provider
├── shadcn-ui/                   ← 所有 Shadcn/UI primitives（40+ 元件）
│   └── *.tsx                    ← Button, Card, Dialog, Sidebar, ...
├── utility-hooks/               ← 框架層 React hooks
│   ├── use-mobile.tsx           ← 響應式斷點偵測
│   └── use-toast.ts             ← Toast 通知
├── utils/                       ← 純工具函式
│   ├── utils.ts                 ← cn()（clsx + tailwind-merge）
│   ├── format-bytes.ts          ← 檔案大小格式化
│   └── i18n.ts                  ← 翻譯輔助函式
├── i18n-types/                  ← 國際化型別定義
│   ├── i18n.schema.ts           ← 翻譯訊息 key schema（Zod）
│   └── i18n.ts                  ← 翻譯型別定義
└── constants/
    └── routes.ts                ← ROUTES 常數（/login, /dashboard, ...）
```

---

## 工作區插件系統

插件系統以「功能能力（Capability）」為單位，每個插件對應一個 `CapabilitySpec`。  
所有插件均從 `src/view-modules/workspaces/plugins/index.ts` barrel 統一匯出。

| 插件 ID | 顯示名稱 | 類型 | 狀態 | 主要功能 |
|---------|---------|------|------|----------|
| `capabilities` | Capabilities | ui | stable | 工作區已掛載能力管理 |
| `members` | Members | governance | stable | 授權式成員管理（WorkspaceGrant） |
| `audit` | Audit | monitoring | stable | 所有重要事件的實時日誌流 |
| `tasks` | Tasks | ui | stable | 任務追蹤（樹狀結構、進度、驗收） |
| `qa` | QA | ui | stable | 品質把關與驗證 |
| `acceptance` | Acceptance | ui | stable | 工作區交付物驗收 |
| `finance` | Finance | ui | beta | 預算追蹤與資金撥付 |
| `issues` | Issues | ui | stable | 技術/財務衝突管理 |
| `daily` | Daily | ui | stable | 技術協作活動牆（日誌 + 按讚 + 留言） |
| `files` | Files | data | stable | 文件主權管理（版本控制） |
| `schedule` | Schedule | ui | stable | 排程採用時間軸（提案/審核/發佈） |
| `document-parser` | Document Parser | ui | beta | AI 智能文件解析（發票、報價單） |

### 雙視角插件（Workspace + Account）

部分插件提供兩種視角：

| 插件 | Workspace 視角 | Account 視角 | 路由 |
|------|---------------|-------------|------|
| schedule | `schedule.workspace-view.tsx` | `schedule.account-view.tsx` | `/account/schedule` |
| audit | `audit.workspace-view.tsx` | `audit.account-view.tsx` | `/account/audit` |
| daily | `daily.workspace-view.tsx` | `daily.account-view.tsx` | `/account/daily` |

---

## 命名慣例速查表

| 類型 | 模式 | 範例 |
|------|------|------|
| Domain Types | `{domain}/{domain}.types.ts` | `schedule/schedule.types.ts` |
| Domain Rules | `{domain}/{domain}.rules.ts` | `schedule/schedule.rules.ts` |
| Server Commands | `{domain}/{domain}.commands.ts` | `schedule/schedule.commands.ts` |
| Use Cases | `{domain}/{domain}.use-cases.ts` | `auth/auth.use-cases.ts` |
| React Hooks | `use-{what-it-does}.ts` | `use-workspace-schedule.ts` |
| Command Hooks | `use-{domain}-commands.ts` | `use-schedule-commands.ts` |
| View (workspace) | `{plugin}.workspace-view.tsx` | `schedule.workspace-view.tsx` |
| View (account) | `{plugin}.account-view.tsx` | `schedule.account-view.tsx` |
| Plugin sub-components | `_components/*.tsx` | `schedule/_components/governance-sidebar.tsx` |
| Barrel | `index.ts` | `export * from './{name}'` |
