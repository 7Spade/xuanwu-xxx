# 垂直切片架構 (Vertical Slice Architecture)

> **目標**：AI 開發零認知 — 實作任何功能只需讀一個資料夾。

---

## 1. 核心概念

### 水平層架構 vs. 垂直切片架構

#### 舊架構（水平層）— 認知負擔高

要理解「排班功能」，需橫跨 **7 個資料夾**：

```
src/domain-types/schedule/          ← 類型定義
src/domain-rules/schedule/          ← 業務規則
src/firebase/firestore/repositories ← 資料庫存取
src/server-commands/schedule/       ← 伺服器動作
src/react-hooks/state-hooks/        ← use-workspace-schedule.ts
src/view-modules/schedule/          ← UI 元件
src/app/.../schedule/               ← 路由
```

→ **7 個地方，才能完整理解 1 個功能**

#### 新架構（垂直切片）— 零認知負擔

要理解「排班功能」，只需讀 **1 個資料夾**：

```
src/features/workspace-governance.schedule/
├── _actions.ts        ← 所有寫入操作
├── _queries.ts        ← 所有讀取/訂閱
├── _types.ts          ← 所有類型定義
├── _hooks/            ← 所有 React hooks
├── _components/       ← 所有 UI 元件
└── index.ts           ← 公開 API
```

→ **1 個資料夾，完整擁有 1 個功能**

---

## 2. 專案分為幾個部分？

**3 個頂層類別，共 22 個模組：**

| 類別 | 模組數 | 說明 |
|------|--------|------|
| `app/` | 1 | Next.js 路由層（純組裝，零業務邏輯） |
| `features/` | 17 | 垂直功能切片（每個業務領域一個） |
| `shared/` | 5 | 跨切片共用基礎設施 |
| **合計** | **23** | |

---

## 3. 完整目錄樹狀圖

```
src/
├── app/                              ← Next.js App Router（路由組裝）
│   ├── layout.tsx
│   ├── (public)/
│   │   ├── login/page.tsx            ← import { LoginView } from "@/features/account.auth"
│   │   ├── reset-password/page.tsx   ← import { ResetPasswordForm } from "@/features/account.auth"
│   │   └── layout.tsx
│   └── (shell)/                      ← 全域 UI 容器層（外殼層，純視覺結構）
│       ├── layout.tsx                ← SidebarProvider（提供 @sidebar + @modal 插槽）
│       ├── @sidebar/default.tsx      ← import { DashboardSidebar } from "@/features/workspace-core"
│       ├── @modal/default.tsx        ← 全域覆蓋層（預設 null）
│       ├── page.tsx                  ← 根入口（redirect）
│       └── (account)/                ← 路由群組：AccountProvider 共用上下文
│           ├── layout.tsx            ← AccountProvider（(dashboard) + (workspaces) 共用）
│           ├── (dashboard)/          ← 路由群組：組織管理業務路由
│           │   └── dashboard/        ← /dashboard/**
│           │       ├── layout.tsx    ← Auth Guard + SidebarInset + @header + @modal
│           │       ├── page.tsx      ← import { DashboardView } from "@/features/workspace-core"
│           │       └── account/
│           │           ├── schedule/page.tsx     ← import { AccountScheduleSection } from "@/features/workspace-governance.schedule"
│           │           ├── members/page.tsx      ← import { MembersView } from "@/features/workspace-governance.members"
│           │           ├── teams/[id]/page.tsx   ← import { TeamDetailView } from "@/features/workspace-governance.teams"
│           │           ├── partners/[id]/page.tsx← import { PartnerDetailView } from "@/features/workspace-governance.partners"
│           │           ├── settings/page.tsx     ← import { UserSettingsView } from "@/features/account-user.profile"
│           │           └── ...
│           └── (workspaces)/         ← 路由群組：工作區模組（列表 + 詳情）
│               └── workspaces/       ← /workspaces/**
│                   ├── layout.tsx
│                   ├── page.tsx      ← import { WorkspacesView } from "@/features/workspace-core"
│                   └── [id]/         ← /workspaces/[id]（WorkspaceProvider）
│                       ├── layout.tsx← import { WorkspaceLayout } from "@/features/workspace-core"
│                       ├── @plugin-tab/
│                       │   ├── schedule/page.tsx      ← import { WorkspaceSchedule } from "@/features/workspace-governance.schedule"
│                       │   ├── daily/page.tsx         ← import { WorkspaceDailyView } from "@/features/workspace-business.daily"
│                       │   ├── tasks/page.tsx         ← import { TasksPlugin } from "@/features/workspace-business.tasks"
│                       │   ├── audit/page.tsx         ← import { AuditWorkspaceView } from "@/features/workspace-governance.audit"
│                       │   ├── members/page.tsx       ← import { MembersPlugin } from "@/features/workspace-governance.members"
│                       │   ├── files/page.tsx         ← import { FilesPlugin } from "@/features/workspace-business.files"
│                       │   ├── issues/page.tsx        ← import { IssuesPlugin } from "@/features/workspace-business.issues"
│                       │   ├── finance/page.tsx       ← import { FinancePlugin } from "@/features/workspace-business.finance"
│                       │   ├── qa/page.tsx            ← import { QaPlugin } from "@/features/workspace-business.qa"
│                       │   ├── acceptance/page.tsx    ← import { AcceptancePlugin } from "@/features/workspace-business.acceptance"
│                       │   └── document-parser/page.tsx← import { DocumentParserPlugin } from "@/features/workspace-business.document-parser"
│                       └── ...
│               └── ...
│
├── features/                         ← 20 個垂直功能切片
│   │
│   ├── auth/                         ← [切片 1] 認證：登入、註冊、重設密碼
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← signIn, registerUser, signOut, sendPasswordReset
│   │   ├── _types.ts                 ← AuthFormValues, RegistrationPayload
│   │   ├── _components/
│   │   │   ├── auth-background.tsx
│   │   │   ├── auth-tabs-root.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── login-view.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── reset-password-dialog.tsx
│   │   │   └── reset-password-form.tsx
│   │   └── index.ts                  ← export { LoginView, ResetPasswordForm }
│   │
│   ├── account/                      ← [切片 2] 組織：CRUD、統計、權限矩陣
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← createOrg, updateOrg, deleteOrg, setupWithTeam
│   │   ├── _queries.ts               ← Firestore listeners
│   │   ├── _types.ts
│   │   ├── _hooks/
│   │   │   └── use-account-management.ts
│   │   ├── _components/
│   │   │   ├── account-grid.tsx
│   │   │   ├── account-new-form.tsx
│   │   │   ├── permission-matrix-view.tsx
│   │   │   ├── permission-tree.tsx
│   │   │   └── stat-cards.tsx
│   │   └── index.ts
│   │
│   ├── workspace-core/               ← [切片 3] 工作區：CRUD、設定、導航、外殼
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← createWorkspace, mountCapabilities, updateSettings
│   │   ├── _queries.ts
│   │   ├── _hooks/
│   │   │   └── use-visible-workspaces.ts
│   │   ├── _components/
│   │   │   ├── create-workspace-dialog.tsx
│   │   │   ├── dashboard-view.tsx
│   │   │   ├── workspace-card.tsx
│   │   │   ├── workspace-grid-view.tsx
│   │   │   ├── workspace-nav-tabs.tsx
│   │   │   ├── workspace-settings.tsx
│   │   │   ├── workspace-status-bar.tsx
│   │   │   ├── workspace-table-view.tsx
│   │   │   └── workspaces-view.tsx
│   │   ├── _shell/                   ← 儀表板外殼（Sidebar、Header）
│   │   │   ├── account-create-dialog.tsx
│   │   │   ├── account-switcher.tsx
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   ├── global-search.tsx
│   │   │   ├── header.tsx
│   │   │   ├── nav-main.tsx
│   │   │   ├── nav-user.tsx
│   │   │   ├── nav-workspaces.tsx
│   │   │   ├── notification-center.tsx
│   │   │   └── theme-adapter.tsx
│   │   └── index.ts
│   │
│   ├── workspace-governance.members/    ← [切片 4] 成員：帳號級 + 工作區級成員管理
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← addMember, removeMember, updateMemberRole
│   │   ├── _queries.ts
│   │   ├── _components/
│   │   │   ├── members-plugin.tsx
│   │   │   └── members-view.tsx
│   │   └── index.ts
│   │
│   ├── workspace-governance.teams/      ← [切片 5] 團隊：團隊管理
│   │   ├── GEMINI.md
│   │   ├── _actions.ts
│   │   ├── _components/
│   │   │   ├── team-detail-view.tsx
│   │   │   └── teams-view.tsx
│   │   └── index.ts
│   │
│   ├── workspace-governance.partners/   ← [切片 6] 協力廠商：夥伴管理
│   │   ├── GEMINI.md
│   │   ├── _actions.ts
│   │   ├── _components/
│   │   │   ├── partner-detail-view.tsx
│   │   │   └── partners-view.tsx
│   │   └── index.ts
│   │
│   ├── workspace-governance.schedule/ ← [切片 7] 排班：排程、提案、審核
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← createScheduleItem, assignMember, updateStatus
│   │   ├── _queries.ts               ← onSnapshot listeners for schedule items
│   │   ├── _types.ts
│   │   ├── _hooks/
│   │   │   ├── use-global-schedule.ts
│   │   │   ├── use-schedule-commands.ts
│   │   │   └── use-workspace-schedule.ts
│   │   ├── _components/
│   │   │   ├── decision-history-columns.tsx
│   │   │   ├── governance-sidebar.tsx
│   │   │   ├── proposal-dialog.tsx
│   │   │   ├── schedule-data-table.tsx
│   │   │   ├── schedule-proposal-content.tsx
│   │   │   ├── schedule.account-view.tsx
│   │   │   ├── schedule.workspace-view.tsx
│   │   │   ├── unified-calendar-grid.tsx
│   │   │   └── upcoming-events-columns.tsx
│   │   └── index.ts
│   │
│   ├── daily/                        ← [切片 8] 工作日誌：貼文、留言、書籤、按讚
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← createDailyLog, toggleLike, addComment, toggleBookmark
│   │   ├── _queries.ts
│   │   ├── _hooks/
│   │   │   ├── use-bookmark-commands.ts
│   │   │   ├── use-daily-commands.ts
│   │   │   ├── use-daily-upload.ts
│   │   │   ├── use-workspace-daily.ts
│   │   │   └── use-aggregated-logs.ts
│   │   ├── _components/
│   │   │   ├── actions/
│   │   │   │   ├── bookmark-button.tsx
│   │   │   │   ├── comment-button.tsx
│   │   │   │   ├── like-button.tsx
│   │   │   │   └── share-button.tsx
│   │   │   ├── composer.tsx
│   │   │   ├── daily-log-card.tsx
│   │   │   ├── daily-log-dialog.tsx
│   │   │   ├── daily.account-view.tsx
│   │   │   ├── daily.view.tsx
│   │   │   ├── daily.workspace-view.tsx
│   │   │   └── image-carousel.tsx
│   │   └── index.ts
│   │
│   ├── tasks/                        ← [切片 9] 任務：任務樹、CRUD
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← createTask, updateTask, deleteTask, batchImport
│   │   ├── _queries.ts
│   │   ├── _components/
│   │   │   └── tasks-plugin.tsx
│   │   └── index.ts
│   │
│   ├── audit/                        ← [切片 10] 稽核：事件追蹤、時間軸
│   │   ├── GEMINI.md
│   │   ├── _queries.ts               ← onSnapshot audit listeners
│   │   ├── _hooks/
│   │   │   ├── use-account-audit.ts
│   │   │   └── use-workspace-audit.ts
│   │   ├── _components/
│   │   │   ├── audit-detail-sheet.tsx
│   │   │   ├── audit-event-item.tsx
│   │   │   ├── audit-timeline.tsx
│   │   │   ├── audit-type-icon.tsx
│   │   │   ├── audit.account-view.tsx
│   │   │   ├── audit.view.tsx
│   │   │   └── audit.workspace-view.tsx
│   │   └── index.ts
│   │
│   ├── files/                        ← [切片 11] 檔案：上傳、管理
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← uploadFile, deleteFile, getFiles
│   │   ├── _hooks/
│   │   │   ├── use-storage.ts
│   │   │   └── use-workspace-filters.ts
│   │   ├── _components/
│   │   │   └── files-plugin.tsx
│   │   └── index.ts
│   │
│   ├── issues/                       ← [切片 12] 議題：追蹤、留言
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← createIssue, addCommentToIssue
│   │   ├── _components/
│   │   │   └── issues-plugin.tsx
│   │   └── index.ts
│   │
│   ├── finance/                      ← [切片 13] 財務：工作區財務插件
│   │   ├── GEMINI.md
│   │   ├── _components/
│   │   │   └── finance-plugin.tsx
│   │   └── index.ts
│   │
│   ├── qa/                           ← [切片 14] 品保：工作區 QA 插件
│   │   ├── GEMINI.md
│   │   ├── _components/
│   │   │   └── qa-plugin.tsx
│   │   └── index.ts
│   │
│   ├── document-parser/              ← [切片 15] 文件解析：AI 發票辨識
│   │   ├── GEMINI.md
│   │   ├── _actions.ts               ← parseDocument (via Genkit)
│   │   ├── _components/
│   │   │   └── document-parser-plugin.tsx
│   │   └── index.ts
│   │
│   ├── acceptance/                   ← [切片 16] 驗收：工作區驗收插件
│   │   ├── GEMINI.md
│   │   ├── _components/
│   │   │   └── acceptance-plugin.tsx
│   │   └── index.ts
│   │
│   └── account-user.profile/         ← [切片 17] 使用者：個人資料、偏好、安全
│       ├── GEMINI.md
│       ├── _actions.ts               ← updateProfile, updatePassword
│       ├── _components/
│       │   ├── preferences-card.tsx
│       │   ├── profile-card.tsx
│       │   ├── security-card.tsx
│       │   ├── user-settings-view.tsx
│       │   └── user-settings.tsx
│       └── index.ts
│
└── shared/                           ← 跨切片共用基礎設施（5 個模組）
    │
    ├── types/                        ← [模組 1] 全域領域類型
    │   ├── GEMINI.md
    │   ├── account.types.ts
    │   ├── workspace.types.ts
    │   ├── schedule.types.ts
    │   ├── task.types.ts
    │   ├── daily.types.ts
    │   ├── audit.types.ts
    │   ├── skill.types.ts
    │   └── index.ts
    │
    ├── lib/                          ← [模組 2] 純工具 + 領域規則
    │   ├── GEMINI.md
    │   ├── account.rules.ts
    │   ├── schedule.rules.ts
    │   ├── skill.rules.ts
    │   ├── task.rules.ts
    │   ├── workspace.rules.ts
    │   ├── format-bytes.ts
    │   ├── i18n.ts
    │   └── utils.ts
    │
    ├── infra/                        ← [模組 3] Firebase 基礎設施
    │   ├── GEMINI.md
    │   ├── auth/
    │   ├── firestore/
    │   │   ├── repositories/
    │   │   └── ...
    │   ├── storage/
    │   └── ...
    │
    ├── ai/                           ← [模組 4] Genkit AI 流程
    │   ├── GEMINI.md
    │   ├── flows/
    │   └── schemas/
    │
    └── ui/                           ← [模組 5] UI 原語
        ├── GEMINI.md
        ├── shadcn-ui/                ← shadcn 元件庫
        ├── app-providers/            ← Firebase/Auth/i18n/Theme providers
        ├── constants/                ← ROUTES, 等
        ├── i18n-types/
        └── utility-hooks/
```

---

## 4. 切片內部結構規則

每個功能切片 `features/{name}/` 的標準內部結構：

```
features/{name}/
├── GEMINI.md           ← 此切片的 AI 說明（必須）
├── _actions.ts         ← "use server" 寫入操作（選用）
├── _queries.ts         ← Firestore 讀取 / onSnapshot（選用）
├── _types.ts           ← 此切片的類型擴充（選用）
├── _hooks/             ← React hooks（選用）
│   └── use-{name}-*.ts
├── _components/        ← UI 元件（選用）
│   └── {name}-*.tsx
└── index.ts            ← 公開 API（必須）
```

### `_` 前綴慣例

- `_actions.ts`、`_queries.ts`、`_types.ts`、`_hooks/`、`_components/` 是**切片私有**的。
- 其他切片**不得**直接引用切片私有路徑（例如禁止 `@/features/workspace-governance.schedule/_hooks/use-workspace-schedule`）。
- 切片間的引用**只能**透過 `index.ts` 公開 API（例如允許 `@/features/workspace-governance.schedule`）。

### `index.ts` 公開 API

只暴露其他切片或 `app/` 確實需要的符號：

```ts
// features/workspace-governance.schedule/index.ts
export { AccountScheduleSection } from "./_components/schedule.account-view";
export { WorkspaceSchedule } from "./_components/schedule.workspace-view";
export { GovernanceSidebar } from "./_components/governance-sidebar";
export { ScheduleProposalContent } from "./_components/schedule-proposal-content";
```

---

## 5. 引用規則

```
✅ 允許的引用模式：

// App 引用功能切片公開 API
import { LoginView } from "@/features/account.auth";
import { WorkspaceSchedule } from "@/features/workspace-governance.schedule";

// 切片引用共用基礎設施
import type { ScheduleItem } from "@/shared/types";
import { canTransitionScheduleStatus } from "@/shared/lib";
import { scheduleRepository } from "@/shared/infra";

// 切片間（僅透過 index.ts）
import { AccountScheduleSection } from "@/features/workspace-governance.schedule";
//                                                         ↑ 只引用到切片根目錄，不到內部子路徑

❌ 禁止的引用模式：

// 直接引用切片私有路徑
import { useWorkspaceSchedule } from "@/features/workspace-governance.schedule/_hooks/use-workspace-schedule";
//                                                              ↑ 禁止：_ 前綴表示私有

// 切片引用另一個切片的私有路徑
import { GovernanceSidebar } from "@/features/workspace-governance.schedule/_components/governance-sidebar";
//                                                               ↑ 禁止：必須透過 index.ts
```

---

## 6. 認知負擔對比

| 場景 | 水平層架構 | 垂直切片架構 |
|------|-----------|-------------|
| 修改排班邏輯 | 需查 7 個資料夾 | 只需查 `features/workspace-governance.schedule/` |
| 新增一個功能 | 需在 7 個層各加一個檔案 | 只需在 `features/{name}/` 加所需檔案 |
| AI 開發上下文 | 需載入整個 layer 的所有檔案 | 只需載入 `features/{name}/` 的 1 個資料夾 |
| 刪除一個功能 | 需從 7 個資料夾分別清除 | 只需刪除 `features/{name}/` |
| 理解邊界 | 需記憶 10 個 layer 的規則 | 只需記憶：公開 API 透過 `index.ts` |

---

## 7. ESLint 邊界規則

```ts
// eslint.config.mts — VSA 邊界規則
{
  // features 切片只能引用 shared/* 和自身，不得引用其他切片內部
  "no-restricted-imports": ["error", {
    patterns: [
      "@/features/*/_{actions,queries,types,hooks,components}/*", // ❌ 禁止引用私有路徑
    ]
  }]
}
```

---

## 8. 新增切片流程

當需要新增一個功能時，AI 的完整指引：

```bash
# 1. 建立切片目錄
mkdir -p src/features/{new-feature}/_components
mkdir -p src/features/{new-feature}/_hooks

# 2. 建立必要文件
touch src/features/{new-feature}/GEMINI.md
touch src/features/{new-feature}/index.ts
touch src/features/{new-feature}/_actions.ts    # 若有寫入操作
touch src/features/{new-feature}/_queries.ts    # 若有讀取訂閱
touch src/features/{new-feature}/_types.ts      # 若有特定類型

# 3. 在 GEMINI.md 描述切片的職責
# 4. 在 index.ts 宣告公開 API
# 5. 在 app/ 對應路由引用 index.ts 匯出的元件
```
