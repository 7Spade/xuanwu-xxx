# Architecture Overview

> 本文件描述專案的整體架構設計原則、分層依賴規則與核心資料流模式。
> 詳細的目錄結構與檔案清單請參閱 [structure-overview.md](./structure-overview.md)。

---

## 核心原則：Occam's Razor

> 不引入超過需求所必要的複雜度。

所有設計、架構與實作決策都必須優先選擇**最簡單、且能完整滿足需求的方案**。

---

## 一、分層架構（One-Way Dependency Architecture）

本專案採用**單向依賴流**，每一層只能依賴其下方的層級，絕不允許向上依賴。

```
┌──────────────────────────────────────────────────┐
│                    app/                          │  ← 路由組裝、頁面組合
├──────────────────────────────────────────────────┤
│                view-modules/                     │  ← 功能 UI 模組
├──────────────────────────────────────────────────┤
│   react-hooks/          react-providers/         │  ← React 狀態與 Context
├──────────────────────────────────────────────────┤
│                  use-cases/                      │  ← 應用層編排（≥2個指令）
├──────────────────────────────────────────────────┤
│               server-commands/                   │  ← Firebase 寫入/讀取封裝
├───────────────────────┬──────────────────────────┤
│     domain-rules/     │     genkit-flows/        │  ← 純業務規則 / AI 流程
├───────────────────────┴──────────────────────────┤
│                   firebase/                      │  ← Firebase SDK 唯一閘道
├──────────────────────────────────────────────────┤
│     domain-types/          shared/               │  ← 型別定義 / 跨層工具
└──────────────────────────────────────────────────┘
```

### 各層職責摘要

| 層級 | 路徑 | 職責 | 是否含 React |
|------|------|------|-------------|
| **app** | `src/app/` | Next.js App Router 路由組裝，純 UI 組合層 | ✅ |
| **view-modules** | `src/view-modules/` | 功能 UI 模組，可組合的 React 元件 | ✅ |
| **react-hooks** | `src/react-hooks/` | 狀態 hooks、指令 hooks、服務 hooks | ✅ |
| **react-providers** | `src/react-providers/` | React Context 全域狀態容器（Firestore 實時監聽） | ✅ |
| **use-cases** | `src/use-cases/` | 應用層編排：≥ 2 個 server-command 的組合工作流 | ❌ |
| **server-commands** | `src/server-commands/` | Firebase 操作的型別化封裝（Next.js Server Actions） | ❌ |
| **domain-rules** | `src/domain-rules/` | 純業務規則與不變條件（invariants），無 I/O | ❌ |
| **genkit-flows** | `src/genkit-flows/` | Google Genkit AI 流程定義 | ❌ |
| **firebase** | `src/firebase/` | Firebase SDK 唯一閘道（Facade + Repository Pattern） | ❌ |
| **domain-types** | `src/domain-types/` | 全域 TypeScript 型別定義，無任何邏輯 | ❌ |
| **shared** | `src/shared/` | 跨層工具函式、Shadcn UI primitives、常數 | 部分 |

---

## 二、依賴矩陣

下表以 ✅ 表示允許依賴，❌ 表示 ESLint 強制禁止：

| 來源層 \ 目標層 | domain-types | domain-rules | firebase | genkit-flows | server-commands | use-cases | react-hooks | react-providers | view-modules | app | shared |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **app** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | — | ✅ |
| **view-modules** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | — | ❌ | ✅ |
| **react-hooks** | ✅ | ✅ | ✅¹ | ❌ | ✅ | ❌ | — | ✅ | ❌ | ❌ | ✅ |
| **react-providers** | ✅ | ❌ | ✅¹ | ❌ | ❌ | ❌ | ✅ | — | ❌ | ❌ | ✅ |
| **use-cases** | ✅ | ✅ | ❌ | ❌ | ✅ | — | ❌ | ❌ | ✅² | ❌ | ✅ |
| **server-commands** | ✅ | ✅ | ✅ | ✅ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ✅³ |
| **domain-rules** | ✅ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **genkit-flows** | ✅ | ❌ | ✅ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **firebase** | ✅ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **domain-types** | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **shared** | ✅ | ❌ | ❌⁴ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — |

> ¹ 僅限 `onSnapshot` 實時監聽，不得執行寫入。  
> ² 僅限 view-bridge re-export，不得包含 React 狀態邏輯。  
> ³ 僅限 `shared/utils`、`shared/constants`、`shared/i18n-types`，不得使用 `shared/shadcn-ui` 或 `shared/utility-hooks`。  
> ⁴ 例外：`shared/app-providers/` 可依賴 `firebase` 用於基礎設施接線（FirebaseProvider）。

---

## 三、ESLint 強制執行

所有層間依賴規則均由 `eslint.config.mts` 的 `no-restricted-imports` 規則在 CI 層面強制執行。  
此外，以下規則在整個 `src/` 範圍內生效：

- `@typescript-eslint/no-explicit-any` → error
- `@typescript-eslint/consistent-type-imports` → error（全域）
- `eslint-plugin-import/no-relative-parent-imports` → warn
- `"use client"` 指令在 `domain-types`、`domain-rules`、`firebase`、`genkit-flows`、`server-commands` 中被 `no-restricted-syntax` 明確禁止

---

## 四、四種規範資料流

詳細時序圖請參閱 [`src/shared/FLOWS.md`](./src/shared/FLOWS.md)。

### Flow A：UI 動作 → Firebase 寫入（標準指令流）

適用於**單一 domain** 的使用者觸發寫入操作。

```
UI Component
  → command-hook (useCallback + auth guard + toast)
    → server-commands/{domain}.commands.ts
      → firebase/firestore/repositories/{domain}.repository.ts
```

**使用時機：** 操作僅涉及 1 個 domain（如書籤、按讚、任務狀態更新）。

---

### Flow B：跨插件協調（事件匯流排流）

適用於 Plugin A 完成後需要**通知 Plugin B** 的場景，不直接耦合。

```
Plugin A view
  → publish("workspace:tasks:completed", payload)
    → WorkspaceEventBus
      → _event-handlers/workspace-event-handler.tsx
        → server-commands/{target-domain}.commands.ts
```

**事件定義位置：** `src/use-cases/workspace/event-bus/workspace-events.ts`  
**訂閱者位置：** `src/app/dashboard/workspaces/[id]/_event-handlers/workspace-event-handler.tsx`

---

### Flow C：多步驟編排（Use-Cases 流）

適用於單一動作需要 **≥ 2 個 Firebase 寫入**且必須原子性成功的場景。

```
UI Component (view-modules or app)
  → use-cases/{domain}/{domain}.use-cases.ts
    → server-commands/A.commands.ts → firebase
    → server-commands/B.commands.ts → firebase
```

**使用時機：** `createWorkspaceWithCapabilities`（1 次建立 + 1 次掛載能力）。

---

### Flow D：實時狀態（Provider / Listener 流）

適用於需要**即時同步**的資料，由多個元件共享。

```
Firestore onSnapshot
  → react-providers/{domain}-provider.tsx (setState)
    → react-hooks/state-hooks/use-{domain}.ts (useContext)
      → view-modules component (renders)
```

**Provider 層級（由外至內）：**
```
FirebaseProvider → AuthProvider → AppProvider → AccountProvider → WorkspaceProvider
```

---

## 五、Firebase 整合架構

### Firestore Facade + Repository Pattern

`firebase/firestore/` 採用 **Facade + Repository** 雙層封裝：

```
server-commands/
  → firestore.facade.ts        ← 統一出口，彙整所有 repository 的 re-export
    → repositories/
        account.repository.ts  ← 組織、成員、團隊
        user.repository.ts     ← 使用者個人資料、書籤
        workspace.repository.ts← 工作區、任務、議題、檔案
        schedule.repository.ts ← 排程項目 CRUD
        daily.repository.ts    ← 每日日誌寫入與讀取
        audit.repository.ts    ← 稽核日誌讀取
```

`firestore.read.adapter.ts` 與 `firestore.write.adapter.ts` 提供底層泛型 CRUD 操作，由各 Repository 組合使用。

### Firestore 資料模型（Collections）

```
accounts/{accountId}
  ├── [fields: name, accountType, members, teams, ...]
  └── invites/{inviteId}

accounts/{accountId}/schedules/{itemId}
  └── [fields: title, status, startDate, endDate, assigneeIds, ...]

workspaces/{workspaceId}
  ├── [fields: name, dimensionId, capabilities, grants, ...]
  ├── tasks/{taskId}
  ├── issues/{issueId}
  └── auditLogs/{logId}

users/{userId}
  ├── [fields: name, email, photoURL, ...]
  └── bookmarks/{bookmarkId}

dailyLogs/{logId}
  ├── [fields: accountId, workspaceId, content, likes, ...]
  └── comments/{commentId}
```

---

## 六、Next.js App Router 平行路由架構

本專案大量使用 Next.js App Router 的 **Parallel Routes**（`@slot`）與 **Intercepting Routes**（`(.)`）。

### Dashboard 頂層 Parallel Routes

```
app/dashboard/layout.tsx
  ├── @sidebar/default.tsx   → DashboardSidebar
  ├── @header/default.tsx    → Header (SidebarTrigger + Breadcrumb)
  └── @modal/                → Dialog overlays
```

### Workspace 詳情頁 Parallel Routes

```
app/dashboard/workspaces/[id]/layout.tsx
  ├── @plugin-tab/           → 工作區功能插件（schedule, tasks, daily, ...)
  ├── @modal/                → 模態框攔截
  │     ├── (.)schedule-proposal  → 排程提案 Dialog
  │     ├── (.)settings           → 工作區設定 Dialog
  │     └── (.)daily-log/[logId]  → 日誌詳情 Dialog
  └── @panel/                → 右側面板攔截
        └── (.)governance         → 治理審核側面板
```

**攔截路由原則：**
- 攔截路由提供 Modal/Sheet 體驗（URL 改變但不換頁）
- 規範路由（canonical route）同時存在，支援直接 URL 存取
- 共享邏輯萃取至 `_components/` 中的共用元件

---

## 七、AI 整合（Genkit）

```
view-modules (UI)
  → server-commands/document-parser/document-parser.commands.ts
    → genkit-flows/flows/*.flow.ts
      → Google Gemini API
```

- Genkit AI 流程僅由 `server-commands` 呼叫
- 每個 flow 定義在 `genkit-flows/flows/*.flow.ts`
- 中央 Genkit 實例配置於 `genkit-flows/genkit.ts`

---

## 八、技術棧

| 分類 | 技術 |
|------|------|
| 框架 | Next.js 15 (App Router) + React 19 |
| 語言 | TypeScript 5（strict mode） |
| 後端即服務 | Firebase 11（Firestore、Auth、Storage、Analytics、Messaging） |
| AI | Google Genkit 1.x + Gemini |
| UI 元件庫 | Shadcn/UI（Radix UI primitives） |
| 樣式 | Tailwind CSS 3 |
| 表單 | React Hook Form + Zod |
| 資料表格 | TanStack Table v8 |
| 狀態管理 | React Context（custom providers）+ Zustand（局部） |
| 建構工具 | Turbopack（`next dev --turbopack`） |
| Lint | ESLint 9（flat config）+ 7 plugins |
| 埠號 | `9002`（開發環境） |
