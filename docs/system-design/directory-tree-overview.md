# Directory Tree Overview

> 本文件提供專案完整目錄樹，含每個重要檔案的一行說明。
> 層級職責與依賴規則請參閱 [architecture-overview.md](./architecture-overview.md)。
> 詳細檔案清單請參閱 [structure-overview.md](./structure-overview.md)。

---

## 根目錄

```
/
├── src/                          ← 所有應用程式原始碼（見下方）
├── functions/                    ← Firebase Cloud Functions（獨立 Node.js workspace）
├── public/                       ← 靜態資源（圖示、字型等）
├── docs/
│   └── events.md                 ← WorkspaceEventBus 事件清單與 payload 說明
├── .github/                      ← CI/CD workflows
├── apphosting.yaml               ← Firebase App Hosting 部署設定
├── architecture-overview.md      ← 架構原則、分層圖、依賴矩陣
├── structure-overview.md         ← 完整目錄結構與檔案清單
├── interaction-overview.md       ← 層間互動關係、生命週期、事件流拓撲
├── dependency-overview.md        ← 各層 import 允許/禁止清單、ESLint 規則
├── data-flow-overview.md         ← 4 種規範資料流、事件目錄、Provider 對應表
├── directory-tree-overview.md    ← 本文件
├── components.json               ← Shadcn/UI CLI 設定
├── eslint.config.mts             ← ESLint flat config（7 plugins + 11 層規則）
├── firebase.json                 ← Firebase 部署設定
├── firestore.indexes.json        ← Firestore 複合索引
├── firestore.rules               ← Firestore 安全規則
├── next.config.ts                ← Next.js 設定（@/ alias、Turbopack）
├── package.json                  ← 依賴清單（Next.js 15、React 19、Firebase 11）
├── postcss.config.mjs            ← PostCSS（Tailwind CSS 前處理）
├── repomix.config.ts             ← Repomix 設定（排除 build artifacts）
├── storage.rules                 ← Firebase Storage 安全規則
├── tailwind.config.ts            ← Tailwind CSS 設定（掃描 ./src/**）
├── tsconfig.json                 ← TypeScript 設定（strict mode + @/ alias）
└── .prettierrc.json              ← Prettier 格式化設定
```

---

## `src/` 完整目錄樹

```
src/
│
├── styles/
│   └── globals.css               ← 全域 CSS（Tailwind base、CSS variables for themes）
│
├── domain-types/                 ← [層] 型別定義。無邏輯，無依賴。
│   ├── domain.ts                 ← 向下相容 re-export barrel（舊版 import 路徑保留）
│   ├── index.ts                  ← 頂層 re-export barrel
│   ├── account/
│   │   ├── account.types.ts      ← Account, AccountType, MemberReference, Team,
│   │   │                            ThemeConfig, ExpertiseBadge, Notification, PartnerInvite
│   │   └── index.ts
│   ├── workspace/
│   │   ├── workspace.types.ts    ← Workspace, WorkspaceGrant, Capability, CapabilitySpec,
│   │   │                            WorkspaceTask, WorkspaceIssue, WorkspaceFile, Location, Address
│   │   └── index.ts
│   ├── schedule/
│   │   ├── schedule.types.ts     ← ScheduleItem, ScheduleStatus ('PROPOSAL'|'OFFICIAL'|'REJECTED')
│   │   └── index.ts
│   ├── task/
│   │   ├── task.types.ts         ← TaskWithChildren（樹狀任務結構）
│   │   └── index.ts
│   ├── daily/
│   │   ├── daily.types.ts        ← DailyLog, DailyLogComment
│   │   └── index.ts
│   └── audit/
│       ├── audit.types.ts        ← AuditLog
│       └── index.ts
│
├── domain-rules/                 ← [層] 純業務規則。無 I/O，無框架。
│   ├── index.ts
│   ├── account/
│   │   ├── account.rules.ts      ← isOrganization, isOwner, getUserTeamIds, getMemberRole
│   │   └── index.ts
│   ├── workspace/
│   │   ├── workspace.rules.ts    ← filterVisibleWorkspaces, hasWorkspaceAccess
│   │   └── index.ts
│   ├── schedule/
│   │   ├── schedule.rules.ts     ← canTransitionScheduleStatus, VALID_STATUS_TRANSITIONS
│   │   └── index.ts
│   ├── task/
│   │   ├── task.rules.ts         ← buildTaskTree（flat list → tree structure）
│   │   └── index.ts
│   └── user/
│       ├── user.rules.ts         ← isAnonymousUser
│       └── index.ts
│
├── firebase/                     ← [層] Firebase SDK 唯一閘道。
│   ├── app.client.ts             ← Firebase App singleton 初始化
│   ├── firebase.config.ts        ← 憑證（從環境變數讀取）
│   ├── auth/
│   │   ├── auth.client.ts        ← Firebase Auth 實例
│   │   └── auth.adapter.ts       ← signIn, register, signOut, onAuthStateChanged
│   ├── analytics/
│   │   ├── analytics.client.ts   ← Firebase Analytics 實例
│   │   └── analytics.adapter.ts  ← logEvent 封裝
│   ├── messaging/
│   │   ├── messaging.client.ts   ← Firebase Cloud Messaging 實例
│   │   └── messaging.adapter.ts  ← FCM token 管理
│   ├── storage/
│   │   ├── storage.client.ts     ← Firebase Storage 實例
│   │   ├── storage.facade.ts     ← Storage 統一出口
│   │   ├── storage.read.adapter.ts  ← getDownloadURL
│   │   └── storage.write.adapter.ts ← uploadBytes, uploadBytesResumable
│   └── firestore/
│       ├── firestore.client.ts      ← Firestore 實例
│       ├── firestore.facade.ts      ← 統一出口（彙整所有 repository re-export）
│       ├── firestore.converter.ts   ← TypeScript 型別化資料轉換器
│       ├── firestore.read.adapter.ts  ← getDocument, getDocuments, getSubCollection
│       ├── firestore.write.adapter.ts ← setDocument, updateDocument, deleteDocument
│       ├── firestore.utils.ts         ← snapshotToRecord, timestampToDate
│       └── repositories/
│           ├── index.ts               ← barrel re-export
│           ├── account.repository.ts  ← 組織 CRUD、成員、團隊、邀請
│           ├── user.repository.ts     ← 使用者個人資料、書籤
│           ├── workspace.repository.ts← 工作區、任務、議題、檔案、授權
│           ├── schedule.repository.ts ← 排程項目 CRUD + 讀取
│           ├── daily.repository.ts    ← 每日日誌寫入 + 讀取 + 留言
│           └── audit.repository.ts    ← 稽核日誌讀取
│
├── genkit-flows/                 ← [層] Google Genkit AI 流程。Server-side only.
│   ├── genkit.ts                 ← 中央 Genkit ai 實例（Google AI plugin）
│   └── flows/
│       └── *.flow.ts             ← AI flow 定義（文件解析、資料提取等）
│
├── server-commands/              ← [層] Firebase 操作封裝（Next.js Server Actions）。無 React。
│   ├── account/
│   │   ├── account.commands.ts   ← createOrganization, updateOrg, inviteMember, createTeam
│   │   └── index.ts
│   ├── auth/
│   │   ├── auth.commands.ts      ← signIn, registerUser, signOut, sendPasswordResetEmail
│   │   └── index.ts
│   ├── workspace/
│   │   ├── workspace.commands.ts ← createWorkspace, updateSettings, deleteWorkspace, mountCapabilities
│   │   └── index.ts
│   ├── schedule/
│   │   ├── schedule.commands.ts  ← createScheduleItem, approveScheduleItem, rejectScheduleItem,
│   │   │                            assignScheduleMembers, unassignScheduleMembers
│   │   └── index.ts
│   ├── daily/
│   │   ├── daily.commands.ts     ← createDailyLog, toggleLike, addComment, deleteComment
│   │   └── index.ts
│   ├── task/
│   │   ├── task.commands.ts      ← createTask, updateTask, deleteTask, batchImportTasks
│   │   └── index.ts
│   ├── audit/
│   │   ├── audit.commands.ts     ← writeAuditEvent
│   │   └── index.ts
│   ├── issue/
│   │   ├── issue.commands.ts     ← createIssue, updateIssue, closeIssue, addComment
│   │   └── index.ts
│   ├── members/
│   │   ├── members.commands.ts   ← getWorkspaceMembers
│   │   └── index.ts
│   ├── bookmark/
│   │   ├── bookmark.commands.ts  ← toggleBookmark
│   │   └── index.ts
│   ├── storage/
│   │   ├── storage.commands.ts   ← uploadPhoto, uploadAttachment, uploadAvatar
│   │   └── index.ts
│   ├── files/
│   │   ├── files.commands.ts     ← getFileManifest
│   │   └── index.ts
│   ├── user/
│   │   ├── user.commands.ts      ← createUserProfile, updateUserProfile
│   │   └── index.ts
│   └── document-parser/
│       ├── document-parser.commands.ts ← parseDocument（呼叫 genkit-flows）
│       └── index.ts
│
├── use-cases/                    ← [層] 應用層編排（≥2 個 server-command 的組合）。無 React 狀態。
│   ├── index.ts                  ← barrel（authFeatures, workspaceFeatures, accountFeatures）
│   ├── auth/
│   │   ├── auth.use-cases.ts     ← completeRegistration（Auth + Firestore 雙寫）
│   │   └── index.ts
│   ├── account/
│   │   ├── account.use-cases.ts  ← setupOrganizationWithTeam
│   │   └── index.ts
│   └── workspace/
│       ├── workspace.use-cases.ts  ← createWorkspaceWithCapabilities
│       ├── workspace-actions.ts    ← React 端封裝（handleCreate/Update/Delete + toast）
│       ├── index.ts
│       └── event-bus/
│           ├── workspace-event-bus.ts  ← EventEmitter 實作（publish, subscribe, unsubscribe）
│           └── workspace-events.ts     ← 所有事件名稱、Payload 型別、EventPayloadMap
│
├── react-providers/              ← [層] React Context Providers 與全域狀態容器。
│   ├── app-provider.tsx          ← AppContext（activeAccount, accounts, notifications,
│   │                                capabilitySpecs, scheduleTaskRequest）
│   ├── account-provider.tsx      ← AccountContext（workspaces, members, scheduleItems,
│   │                                dailyLogs, auditLogs）— Firestore 實時監聽
│   ├── workspace-provider.tsx    ← WorkspaceContext（tasks, issues, files, grants, auditLogs）
│   │                                — Firestore 實時監聽
│   └── workspace-event-context.ts← WorkspaceEventBus Context 型別定義
│
├── react-hooks/                  ← [層] React Hooks（狀態讀取、指令封裝、服務封裝）。
│   ├── state-hooks/              ← 讀取 Context 狀態（無副作用）
│   │   ├── use-app.ts            ← 讀取 AppContext
│   │   ├── use-account.ts        ← 讀取 AccountContext（完整資料）
│   │   ├── use-user.ts           ← 讀取 AuthContext（當前用戶）
│   │   ├── use-account-management.ts  ← 組織管理操作封裝
│   │   ├── use-account-audit.ts       ← 帳號稽核日誌（獨立 onSnapshot）
│   │   ├── use-workspace-audit.ts     ← 工作區稽核日誌（獨立 onSnapshot）
│   │   ├── use-workspace-daily.ts     ← 工作區每日日誌狀態
│   │   ├── use-workspace-filters.ts   ← 工作區篩選狀態（progressState, assignee 等）
│   │   ├── use-workspace-schedule.ts  ← 工作區排程狀態 + 跳轉至提案頁導航函式
│   │   ├── use-global-schedule.ts     ← 帳號層排程彙整（所有工作區 + 治理操作入口）
│   │   ├── use-visible-workspaces.ts  ← 依 WorkspaceGrant 篩選可見工作區
│   │   └── use-aggregated-logs.ts     ← 跨工作區日誌彙整（帳號層 daily 視角）
│   ├── command-hooks/            ← 封裝寫入操作（auth guard + toast + useCallback）
│   │   ├── use-schedule-commands.ts        ← approve / reject / assign / unassign
│   │   ├── use-workspace-commands.ts       ← deleteWorkspace
│   │   ├── use-daily-commands.ts           ← toggleLike, addComment
│   │   ├── use-bookmark-commands.ts        ← toggleBookmark
│   │   └── use-workspace-event-handler.tsx ← 工作區事件匯流排訂閱者（Flow B 的核心）
│   └── service-hooks/            ← 封裝基礎設施服務
│       ├── use-logger.ts         ← 稽核日誌寫入（useLogger）
│       ├── use-storage.ts        ← Firebase Storage 上傳（useStorage）
│       └── use-daily-upload.ts   ← 每日日誌圖片上傳（useDailyUpload）
│
├── shared/                       ← [層] 跨層工具（domain-agnostic）。
│   ├── FLOWS.md                  ← 4 種規範資料流時序圖（A-D，含 Mermaid）
│   ├── app-providers/            ← 基礎設施 React Providers（例外：可 import @/firebase）
│   │   ├── firebase-provider.tsx ← Firebase App 實例注入
│   │   ├── auth-provider.tsx     ← Firebase Auth 狀態監聽
│   │   ├── theme-provider.tsx    ← next-themes（dark/light mode）
│   │   └── i18n-provider.tsx     ← 國際化 Provider
│   ├── shadcn-ui/                ← 所有 Shadcn/UI primitives（由 @/ alias 統一引用）
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── button-group.tsx
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
│   │   ├── input.tsx
│   │   ├── input-group.tsx
│   │   ├── input-otp.tsx
│   │   ├── item.tsx
│   │   ├── kbd.tsx
│   │   ├── label.tsx
│   │   ├── language-switcher.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── page-header.tsx
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
│   │   ├── toggle.tsx
│   │   ├── toggle-group.tsx
│   │   └── tooltip.tsx
│   ├── utility-hooks/
│   │   ├── use-mobile.tsx        ← 響應式斷點偵測（isMobile）
│   │   └── use-toast.ts          ← Toast 通知（Sonner 封裝）
│   ├── utils/
│   │   ├── utils.ts              ← cn()（clsx + tailwind-merge）
│   │   ├── format-bytes.ts       ← 檔案大小格式化（formatBytes）
│   │   └── i18n.ts               ← 翻譯輔助函式（t()）
│   ├── i18n-types/
│   │   ├── i18n.schema.ts        ← 翻譯訊息 key schema（Zod）
│   │   └── i18n.ts               ← 翻譯型別定義（I18nMessages）
│   └── constants/
│       └── routes.ts             ← ROUTES 常數（/login, /dashboard, /account/schedule 等）
│
└── app/                          ← [層] Next.js App Router（路由組裝，純 UI 組合層）。
    ├── layout.tsx                ← 根佈局（FirebaseProvider + AuthProvider + AppProvider 掛載）
    ├── page.tsx                  ← 根頁（重定向至 /login）
    ├── favicon.ico
    │
    ├── (auth-routes)/            ← 路由群組（不影響 URL 路徑）
    │   ├── layout.tsx            ← 認證頁佈局
    │   ├── @modal/               ← Parallel Route slot
    │   │   ├── (.)reset-password/
    │   │   │   └── page.tsx      ← Intercepting Route → 重設密碼 Dialog
    │   │   └── default.tsx       ← 預設（null）
    │   ├── login/
    │   │   └── page.tsx          ← 登入/註冊頁（LoginView + 兩個 Tab）
    │   └── reset-password/
    │       └── page.tsx          ← 重設密碼全頁（canonical route）
    │
    └── dashboard/
        ├── layout.tsx            ← Auth Guard + AccountProvider + SidebarProvider
        ├── page.tsx              ← 重定向至 /workspaces
        ├── @sidebar/
        │   └── default.tsx       ← Parallel Route → DashboardSidebar
        ├── @header/
        │   └── default.tsx       ← Parallel Route → Header（SidebarTrigger + Breadcrumb）
        ├── @modal/
        │   ├── (.)account/new/
        │   │   └── page.tsx      ← Intercepting Route → 新建帳號 Dialog
        │   └── default.tsx
        │
        ├── account/              ← 帳號層功能頁
        │   ├── new/page.tsx      ← 新建組織全頁
        │   ├── members/page.tsx  ← 成員管理頁
        │   ├── teams/
        │   │   ├── page.tsx      ← 團隊列表頁
        │   │   └── [id]/page.tsx ← 團隊詳情頁
        │   ├── partners/
        │   │   ├── page.tsx      ← 合作方列表頁
        │   │   └── [id]/page.tsx ← 合作方詳情頁
        │   ├── settings/page.tsx ← 帳號設定頁
        │   ├── matrix/page.tsx   ← 權限矩陣頁
        │   ├── schedule/page.tsx ← 組織排程管理頁（AccountScheduleSection）
        │   ├── daily/page.tsx    ← 組織每日日誌頁
        │   └── audit/page.tsx    ← 組織稽核日誌頁
        │
        └── workspaces/           ← 工作區功能頁
            ├── layout.tsx        ← 工作區列表佈局
            ├── page.tsx          ← 工作區列表頁（WorkspacesView）
            ├── new/page.tsx      ← 新建工作區全頁（canonical）
            ├── @modal/
            │   ├── (.)new/page.tsx   ← Intercepting Route → 新建工作區 Dialog
            │   └── default.tsx
            │
            └── [id]/             ← 單一工作區詳情頁
                ├── layout.tsx    ← WorkspaceProvider + 工作區 Header + NavTabs
                ├── page.tsx      ← 重定向至預設插件 Tab
                ├── settings/page.tsx       ← 工作區設定全頁（canonical）
                ├── governance/page.tsx     ← 治理審核全頁（canonical）
                ├── schedule-proposal/page.tsx ← 排程提案全頁（canonical）
                ├── daily-log/[logId]/page.tsx ← 日誌詳情全頁（canonical）
                │
                ├── @plugin-tab/            ← Parallel Route slot（插件 Tab 內容）
                │   ├── default.tsx         ← 預設空白頁
                │   ├── loading.tsx         ← Skeleton 骨架屏（所有插件共用）
                │   ├── error.tsx           ← 錯誤邊界
                │   ├── acceptance/page.tsx ← 驗收插件
                │   ├── audit/
                │   │   ├── page.tsx        ← 稽核插件
                │   │   └── loading.tsx
                │   ├── capabilities/page.tsx ← 能力設定插件
                │   ├── daily/
                │   │   ├── page.tsx        ← 每日日誌插件
                │   │   └── loading.tsx
                │   ├── document-parser/page.tsx ← 文件解析插件
                │   ├── files/page.tsx      ← 檔案管理插件
                │   ├── finance/page.tsx    ← 財務插件
                │   ├── issues/page.tsx     ← 議題管理插件
                │   ├── members/page.tsx    ← 成員管理插件
                │   ├── qa/page.tsx         ← QA 插件
                │   ├── schedule/
                │   │   ├── page.tsx        ← 排程插件
                │   │   └── loading.tsx
                │   └── tasks/
                │       ├── page.tsx        ← 任務管理插件
                │       └── loading.tsx
                │
                ├── @modal/                 ← Parallel Route slot（Dialog 攔截）
                │   ├── (.)settings/page.tsx        ← 工作區設定 Dialog
                │   ├── (.)schedule-proposal/page.tsx ← 排程提案 Dialog
                │   ├── (.)daily-log/[logId]/page.tsx ← 日誌詳情 Dialog
                │   └── default.tsx
                │
                └── @panel/                ← Parallel Route slot（右側面板攔截）
                    ├── (.)governance/page.tsx ← 治理審核 Sheet 面板
                    └── default.tsx
```

---

## `src/view-modules/` 完整目錄樹

```
view-modules/
├── auth/
│   ├── auth-background.tsx         ← 登入頁背景（動畫效果）
│   ├── auth-tabs-root.tsx          ← 登入/註冊 Tabs 容器
│   ├── login-form.tsx              ← 登入表單
│   ├── login-view.tsx              ← 登入頁主元件
│   ├── register-form.tsx           ← 註冊表單
│   ├── reset-password-dialog.tsx   ← 重設密碼 Dialog 版
│   └── reset-password-form.tsx     ← 重設密碼表單（Dialog + 全頁共用）
│
├── dashboard/
│   ├── account-grid.tsx            ← 帳號卡片網格（儀表板首頁）
│   ├── account-new-form.tsx        ← 新建組織表單
│   ├── dashboard-view.tsx          ← 儀表板首頁（stat-cards + workspace-list）
│   ├── permission-tree.tsx         ← 權限樹狀展示元件
│   ├── stat-cards.tsx              ← 統計卡片（工作區數、成員數等）
│   ├── workspace-list.tsx          ← 工作區列表（儀表板首頁版）
│   ├── layout/
│   │   ├── global-search.tsx       ← 全域搜尋（Command Dialog）
│   │   ├── header.tsx              ← Header（SidebarTrigger + Breadcrumb + 通知 + 搜尋）
│   │   ├── notification-center.tsx ← 通知中心 Popover
│   │   └── theme-adapter.tsx       ← 組織自訂主題動態套用
│   └── sidebar/
│       ├── account-create-dialog.tsx ← 新建帳號 Dialog（在 Sidebar 觸發）
│       ├── account-switcher.tsx     ← 帳號切換器（DropdownMenu）
│       ├── index.tsx                ← DashboardSidebar（含 SidebarRail）
│       ├── nav-main.tsx             ← 主導航項目（帳號功能列表）
│       ├── nav-user.tsx             ← 使用者選單（頭像 + 登出）
│       └── nav-workspaces.tsx       ← 工作區導航列表（collapsible）
│
├── workspaces/
│   ├── create-workspace-dialog.tsx  ← 新建工作區 Dialog
│   ├── workspace-card.tsx           ← 工作區卡片（grid view 用）
│   ├── workspace-grid-view.tsx      ← 工作區網格視圖
│   ├── workspace-list-header.tsx    ← 工作區列表頁標題列（含建立按鈕）
│   ├── workspace-nav-tabs.tsx       ← 工作區插件 Tab 導航
│   ├── workspace-settings.tsx       ← 工作區設定表單（名稱、可見度、狀態）
│   ├── workspace-status-bar.tsx     ← 工作區狀態列（生命週期狀態顯示）
│   ├── workspace-table-view.tsx     ← 工作區表格視圖
│   ├── workspaces-view.tsx          ← 工作區列表頁主元件（grid/table 切換）
│   └── plugins/
│       ├── index.ts                 ← 所有插件 barrel export
│       ├── acceptance/
│       │   └── acceptance-plugin.tsx ← 驗收插件主元件
│       ├── audit/
│       │   ├── audit.account-view.tsx    ← 帳號層稽核視圖
│       │   ├── audit.view.tsx            ← 稽核基礎元件
│       │   ├── audit.workspace-view.tsx  ← 工作區層稽核視圖
│       │   └── _plugin-components/
│       │       ├── audit-detail-sheet.tsx  ← 稽核事件詳情 Sheet
│       │       ├── audit-event-item.tsx    ← 單筆稽核事件列表項
│       │       ├── audit-timeline.tsx      ← 稽核時間軸
│       │       └── audit-type-icon.tsx     ← 稽核類型圖示
│       ├── daily/
│       │   ├── daily.account-view.tsx     ← 帳號層日誌視圖（跨工作區）
│       │   ├── daily.view.tsx             ← 日誌基礎元件
│       │   ├── daily.workspace-view.tsx   ← 工作區層日誌視圖
│       │   └── _plugin-components/
│       │       ├── composer.tsx           ← 日誌撰寫框
│       │       ├── daily-log-card.tsx     ← 日誌卡片
│       │       ├── daily-log-dialog.tsx   ← 日誌詳情 Dialog
│       │       ├── image-carousel.tsx     ← 日誌圖片輪播
│       │       └── actions/
│       │           ├── bookmark-button.tsx
│       │           ├── comment-button.tsx
│       │           ├── like-button.tsx
│       │           └── share-button.tsx
│       ├── document-parser/
│       │   └── document-parser-plugin.tsx ← AI 文件解析插件（上傳 + 預覽 + 確認）
│       ├── files/
│       │   └── files-plugin.tsx          ← 檔案管理插件（版本列表 + 上傳）
│       ├── finance/
│       │   └── finance-plugin.tsx        ← 財務插件（預算 + 支付）
│       ├── issues/
│       │   └── issues-plugin.tsx         ← 議題管理插件
│       ├── members/
│       │   └── members-plugin.tsx        ← 成員管理插件（Grant 授權管理）
│       ├── plugin-settings/
│       │   └── plugin-settings.tsx       ← 能力設定插件（已掛載能力列表 + 設定）
│       ├── qa/
│       │   └── qa-plugin.tsx             ← QA 插件（驗證佇列 + 通過/拒絕）
│       ├── tasks/
│       │   └── tasks-plugin.tsx          ← 任務管理插件（樹狀 + 進度 + 批次匯入）
│       └── (schedule 已提升為頂層 view-modules，見 src/view-modules/schedule/)
│
├── account/
│   └── permission-matrix-view.tsx  ← 權限矩陣頁（角色 × 能力 交叉表）
│
├── schedule/                        ← 一核兩視圖：跨 account + workspace 的排程模組
│   ├── index.ts                     ← 統一出口（AccountScheduleSection, WorkspaceSchedule, GovernanceSidebar, ScheduleProposalContent）
│   ├── schedule.account-view.tsx    ← Account 視角：全域日曆 + 治理審核 + 人力指派
│   ├── schedule.workspace-view.tsx  ← Workspace 視角：工作區日曆 + 提案入口
│   └── _components/                 ← 兩視角共用的排程子元件（私有）
│       ├── decision-history-columns.tsx  ← 審核歷史表格欄位定義
│       ├── governance-sidebar.tsx         ← 治理側欄（待審清單 + 批准/拒絕）
│       ├── proposal-dialog.tsx            ← 排程提案 Dialog
│       ├── schedule-data-table.tsx        ← 排程資料表格（TanStack Table）
│       ├── schedule-proposal-content.tsx  ← 排程提案共用邏輯（Dialog + 全頁共用）
│       ├── unified-calendar-grid.tsx      ← 統一日曆格狀視圖（workspace / organization 兩模式）
│       └── upcoming-events-columns.tsx    ← 即將到來事件表格欄位定義
│
├── members/
│   └── members-view.tsx            ← 組織成員管理頁
│
├── partners/
│   ├── partners-view.tsx           ← 外部合作方列表頁
│   └── partner-detail-view.tsx     ← 合作方詳情頁
│
├── teams/
│   ├── teams-view.tsx              ← 團隊列表頁
│   └── team-detail-view.tsx        ← 團隊詳情頁（成員、說明）
│
└── user-settings/
    ├── preferences-card.tsx        ← 偏好設定卡（語言、主題）
    ├── profile-card.tsx            ← 個人資料卡（名稱、頭像、Bio）
    ├── security-card.tsx           ← 安全設定卡（密碼變更）
    ├── user-settings-view.tsx      ← 使用者設定主頁（卡片組合）
    └── user-settings.tsx           ← 使用者設定入口元件
```
