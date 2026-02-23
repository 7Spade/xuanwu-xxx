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
├── docs/                         ← 設計文件
├── apphosting.yaml               ← Firebase App Hosting 部署設定
├── components.json               ← Shadcn/UI CLI 設定
├── eslint.config.mts             ← ESLint flat config（7 plugins）
├── firebase.json                 ← Firebase 部署設定
├── firestore.indexes.json        ← Firestore 複合索引
├── firestore.rules               ← Firestore 安全規則
├── next.config.ts                ← Next.js 設定（@/ alias、Turbopack）
├── package.json
├── storage.rules                 ← Firebase Storage 安全規則
├── tailwind.config.ts
└── tsconfig.json                 ← TypeScript strict mode + @/ alias
```

---

## `src/` 完整目錄樹

```
src/
├── styles/
│   └── globals.css               ← 全域 CSS（Tailwind base、CSS variables for themes）
│
├── shared/                       ← 跨切片共用基礎設施
│   │
│   ├── types/                    ← [模組 1] 全域領域類型（無邏輯，無依賴）
│   │   ├── account.types.ts      ← Account, AccountType, MemberReference, Team, Wallet
│   │   ├── workspace.types.ts    ← Workspace, WorkspaceGrant, Capability, CapabilitySpec
│   │   ├── schedule.types.ts     ← ScheduleItem, ScheduleStatus
│   │   ├── task.types.ts         ← TaskWithChildren
│   │   ├── daily.types.ts        ← DailyLog, DailyLogComment
│   │   ├── audit.types.ts        ← AuditLog
│   │   ├── skill.types.ts        ← SkillTag, SkillGrant, SkillRequirement, SkillTier
│   │   └── index.ts              ← 頂層 re-export barrel
│   │
│   ├── lib/                      ← [模組 2] 純工具函式 + 領域規則（無 I/O，無框架）
│   │   ├── account.rules.ts      ← isOrganization, isOwner, getMemberRole
│   │   ├── workspace.rules.ts    ← filterVisibleWorkspaces, hasWorkspaceAccess
│   │   ├── schedule.rules.ts     ← canTransitionScheduleStatus, VALID_STATUS_TRANSITIONS
│   │   ├── task.rules.ts         ← buildTaskTree
│   │   ├── skill.rules.ts        ← TIER_DEFINITIONS, resolveSkillTier, tierSatisfies
│   │   ├── utils.ts              ← cn()（clsx + tailwind-merge）
│   │   ├── format-bytes.ts       ← 檔案大小格式化
│   │   └── i18n.ts               ← 翻譯輔助函式
│   │
│   ├── infra/                    ← [模組 3] Firebase SDK 唯一閘道
│   │   ├── app.client.ts         ← Firebase App singleton 初始化
│   │   ├── firebase.config.ts    ← 憑證（從環境變數讀取）
│   │   ├── auth/
│   │   │   ├── auth.client.ts    ← Firebase Auth 實例
│   │   │   └── auth.adapter.ts   ← signIn, register, signOut...
│   │   ├── analytics/
│   │   ├── messaging/
│   │   ├── storage/
│   │   │   ├── storage.client.ts
│   │   │   ├── storage.facade.ts
│   │   │   ├── storage.read.adapter.ts
│   │   │   └── storage.write.adapter.ts
│   │   └── firestore/
│   │       ├── firestore.client.ts
│   │       ├── firestore.facade.ts      ← 統一出口：彙整所有 repository re-export
│   │       ├── firestore.converter.ts   ← TypeScript 型別化資料轉換器
│   │       ├── firestore.read.adapter.ts
│   │       ├── firestore.write.adapter.ts
│   │       ├── firestore.utils.ts
│   │       └── repositories/
│   │           ├── account.repository.ts    ← 組織、成員、團隊
│   │           ├── user.repository.ts       ← 使用者個人資料、書籤
│   │           ├── workspace.repository.ts  ← 工作區、任務、議題、檔案
│   │           ├── schedule.repository.ts   ← 排程項目 CRUD
│   │           ├── daily.repository.ts      ← 每日日誌
│   │           └── audit.repository.ts      ← 稽核日誌
│   │
│   ├── ai/                       ← [模組 4] Google Genkit AI 流程（Server-side）
│   │   ├── genkit.ts             ← 中央 Genkit ai 實例設定
│   │   ├── dev.ts
│   │   ├── flows/                ← AI flow 定義（文件解析等）
│   │   └── schemas/
│   │
│   └── ui/                       ← [模組 5] UI 原語（Shadcn + providers + 常數）
│       ├── shadcn-ui/            ← 所有 Shadcn/UI primitives（40+ 元件）
│       ├── app-providers/        ← 基礎設施 React Providers
│       │   ├── firebase-provider.tsx  ← Firebase App 實例注入
│       │   ├── auth-provider.tsx      ← Firebase Auth 狀態監聽
│       │   ├── theme-provider.tsx     ← next-themes 暗色模式
│       │   └── i18n-provider.tsx      ← 國際化 Provider
│       ├── constants/
│       │   └── routes.ts         ← ROUTES 常數（/login, /dashboard, ...）
│       ├── i18n-types/           ← 國際化型別定義與 schema
│       └── utility-hooks/
│           ├── use-mobile.tsx    ← 響應式斷點偵測
│           └── use-toast.ts      ← Toast 通知
│
├── features/                     ← 20 個垂直功能切片
│   │   (每個切片: GEMINI.md + _actions.ts + _queries.ts + _hooks/ + _components/ + index.ts)
│   │
│   ├── auth/                     ← [切片 1] 認證：登入、註冊、重設密碼
│   ├── account/                  ← [切片 2] 組織：CRUD、統計、權限矩陣
│   ├── workspace-core/            ← [切片 3] 工作區：CRUD、設定、導航、外殼
│   │   └── _shell/               ← 儀表板外殼（Sidebar、Header）
│   ├── workspace-governance.members/  ← [切片 4] 成員管理
│   ├── workspace-governance.teams/    ← [切片 5] 團隊管理
│   ├── workspace-governance.partners/ ← [切片 6] 協力廠商管理
│   ├── workspace-governance.schedule/ ← [切片 7] 排班、提案、治理審核
│   ├── workspace-business.daily/    ← [切片 8] 工作日誌、留言、書籤、按讚
│   ├── workspace-business.tasks/    ← [切片 9] 任務樹、CRUD
│   ├── workspace-governance.audit/  ← [切片 10] 稽核事件追蹤
│   ├── workspace-business.files/   ← [切片 11] 檔案上傳、管理
│   ├── workspace-business.issues/  ← [切片 12] 議題追蹤
│   ├── workspace-business.finance/ ← [切片 13] 財務插件
│   ├── workspace-business.qa/     ← [切片 14] QA 插件
│   ├── workspace-business.document-parser/ ← [切片 15] AI 文件解析
│   ├── workspace-business.acceptance/ ← [切片 16] 驗收插件
│   └── account-user.profile/     ← [切片 17] 使用者個人資料、偏好、安全
│
└── app/                          ← Next.js App Router（路由組裝，純 UI 組合層）
    ├── layout.tsx                ← 根佈局（providers：FirebaseProvider → AuthProvider → AppProvider）
    ├── favicon.ico
    │
    ├── (public)/                 ← 路由群組：未登入頁面
    │   ├── layout.tsx            ← 認證頁佈局
    │   ├── @modal/               ← Parallel Route slot
    │   │   ├── (.)reset-password/page.tsx ← Intercepting Route → 重設密碼 Dialog
    │   │   └── default.tsx
    │   ├── login/page.tsx        ← 登入/註冊頁（LoginView）
    │   └── reset-password/page.tsx ← 重設密碼全頁（canonical）
    │
    └── (shell)/                  ← 路由群組：全域 UI 容器層（外殼層，不承載業務）
        ├── layout.tsx            ← SidebarProvider（提供 @sidebar + @modal 插槽）
        ├── @sidebar/             ← Parallel Route slot — DashboardSidebar
        │   └── default.tsx
        ├── @modal/               ← Parallel Route slot — 全域覆蓋層（預設 null）
        │   └── default.tsx
        ├── page.tsx              ← 根頁 / → 重定向至 /login
        │
        └── (account)/            ← 路由群組：AccountProvider 共用上下文
            ├── layout.tsx        ← AccountProvider（(dashboard) + (workspaces) 共用）
            │
            ├── (dashboard)/      ← 路由群組：組織管理業務路由（繼承 shell + account 佈局）
            │   └── dashboard/    ← /dashboard/**
            │       ├── layout.tsx    ← Auth Guard + SidebarInset + @header + @modal
            │       ├── page.tsx      ← /dashboard 首頁
            │       ├── @header/default.tsx   ← Header（SidebarTrigger + Breadcrumb）
            │       ├── @modal/
            │       │   ├── (.)account/new/page.tsx ← 新建帳號 Dialog
            │       │   └── default.tsx
            │       └── account/
            │           ├── audit/page.tsx
            │           ├── daily/page.tsx
            │           ├── matrix/page.tsx
            │           ├── members/page.tsx
            │           ├── new/page.tsx
            │           ├── partners/page.tsx + [id]/page.tsx
            │           ├── schedule/page.tsx
            │           ├── settings/page.tsx
            │           └── teams/page.tsx + [id]/page.tsx
            │
            └── (workspaces)/     ← 路由群組：工作區模組（列表 + 詳情，URL: /workspaces/**）
                └── workspaces/
                    ├── layout.tsx    ← 工作區模組共用佈局（可選）
                    ├── page.tsx      ← /workspaces（工作區列表）
                    ├── new/page.tsx  ← /workspaces/new（新建）
                    ├── @modal/
                    │   ├── (.)new/page.tsx  ← 新建工作區 Dialog
                    │   └── default.tsx
                    └── [id]/         ← /workspaces/[id]（特定工作區）
                        ├── layout.tsx    ← WorkspaceProvider
                        ├── page.tsx
                        ├── settings/page.tsx
                        ├── governance/page.tsx
                        ├── schedule-proposal/page.tsx
                        ├── daily-log/[logId]/page.tsx
                        ├── @plugin-tab/     ← Parallel Route（插件 Tab 內容）
                        │   ├── acceptance/ audit/ capabilities/ daily/
                        │   ├── document-parser/ files/ finance/ issues/
                        │   ├── members/ qa/ schedule/ tasks/
                        │   └── default.tsx  loading.tsx  error.tsx
                        ├── @modal/          ← Dialog 攔截
                        │   ├── (.)settings/
                        │   ├── (.)schedule-proposal/
                        │   ├── (.)daily-log/[logId]/
                        │   └── default.tsx
                        └── @panel/          ← 右側面板攔截
                            ├── (.)governance/
                            └── default.tsx
```
