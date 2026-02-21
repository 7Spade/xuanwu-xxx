# Architecture Overview

> 本文件描述專案的整體架構設計原則、分層依賴規則與核心資料流模式。
> 詳細的目錄結構與檔案清單請參閱 [structure-overview.md](./structure-overview.md)。

---

## 核心原則：Occam's Razor

> 不引入超過需求所必要的複雜度。

所有設計、架構與實作決策都必須優先選擇**最簡單、且能完整滿足需求的方案**。

---

## 一、垂直切片架構（Vertical Slice Architecture — VSA）

> **目標：AI 開發零認知 — 實作任何功能只需讀一個資料夾。**

```
src/
├── app/          ← Next.js 路由層（純組裝，零業務邏輯）
├── features/     ← 17 個垂直功能切片（每個業務領域一個）
└── shared/       ← 5 個跨切片共用基礎設施模組
```

### 依賴流（單向）

```
app/  →  features/{name}/index.ts  →  shared/*
```

- `app/` 僅 import `features/*/index.ts`（公開 API）和 `shared/*`
- `features/*` import `shared/*`，以及其他切片的 `index.ts`（禁止 import 私有 `_` 路徑）
- `shared/*` 零功能依賴

### 切片公開 API 規則

```ts
// ✅ 允許：透過 index.ts
import { AccountScheduleSection } from "@/features/workspace-governance.schedule";

// ❌ 禁止：直接引用切片私有路徑
import { useWorkspaceSchedule } from "@/features/workspace-governance.schedule/_hooks/use-workspace-schedule";
```

---

## 二、shared/ 五個模組

| 模組 | 路徑 | 職責 |
|------|------|------|
| `types` | `shared/types/` | 全域 TypeScript 領域類型 |
| `lib` | `shared/lib/` | 純工具函式 + 領域規則（無 I/O） |
| `infra` | `shared/infra/` | Firebase SDK 唯一閘道（Auth、Firestore、Storage） |
| `ai` | `shared/ai/` | Genkit AI 流程定義 |
| `ui` | `shared/ui/` | Shadcn/UI primitives、app-providers、常數、i18n |

---

## 三、app/ 路由群組

```
src/app/
├── (public)/          ← 公開路由（未登入可存取：/login、/reset-password）
├── (shell)/           ← 全域 UI 容器層（純視覺結構：SidebarProvider + @sidebar + @modal）
│   └── (dashboard)/   ← 認證後業務路由群組（繼承 shell 佈局，Auth Guard + AccountProvider）
│       └── dashboard/ ← /dashboard/** 實際 URL 段
└── layout.tsx         ← 根 layout（providers，必須在根層）
```

`(shell)` 與 `(dashboard)` 皆為路由群組（對 URL 透明）。`(dashboard)` 嵌套在 `(shell)` 內，自動繼承 shell 佈局（SidebarProvider），再疊加自身的 Auth Guard + AccountProvider。

路由群組（`(name)`）對 URL 透明，不影響路徑結構。

---

## 四、四種規範資料流

### Flow A：UI 動作 → Firebase 寫入

單一 domain 的使用者寫入操作：

```
UI Component
  → features/{name}/_hooks/use-{domain}-commands.ts (useCallback + auth guard + toast)
    → features/{name}/_actions.ts ("use server" action)
      → shared/infra/firestore/repositories/{domain}.repository.ts
```

### Flow B：跨切片協調（事件匯流排）

Plugin A 完成後需通知 Plugin B：

```
Plugin A → publish("workspace:tasks:completed", payload)
  → WorkspaceEventBus
    → features/workspace-core/_components/workspace-event-handler.tsx
      → features/{target}/_actions.ts
```

### Flow C：多步驟編排

單一動作需 ≥2 次 Firebase 寫入：

```
UI → features/workspace-core/_use-cases.ts
  → features/workspace-core/_actions.ts  (write A)
  → features/workspace-core/_actions.ts  (write B)
```

### Flow D：實時狀態（Provider / Listener）

多元件共享即時資料：

```
Firestore onSnapshot
  → features/workspace-core/_components/workspace-provider.tsx (setState)
    → features/workspace-core/index.ts → useWorkspace()
      → UI component (重新渲染)
```

---

## 五、Firebase 整合

### Firestore Facade + Repository

```
features/{name}/_actions.ts
  → shared/infra/firestore/repositories/{domain}.repository.ts
    → shared/infra/firestore/firestore.write.adapter.ts / firestore.read.adapter.ts
      → Firestore (Google Cloud)
```

### Firestore 資料模型

```
accounts/{accountId}
  └── schedules/{itemId}

workspaces/{workspaceId}
  ├── tasks/{taskId}
  ├── issues/{issueId}
  └── auditLogs/{logId}

users/{userId}
  └── bookmarks/{bookmarkId}

dailyLogs/{logId}
  └── comments/{commentId}
```

---

## 六、Next.js App Router 平行路由

### Shell 頂層（全域 UI 外殼）

```
app/(shell)/layout.tsx
  ├── @sidebar/default.tsx   → DashboardSidebar（全域側欄）
  └── @modal/default.tsx     → 全域覆蓋層（預設 null）
```

### Dashboard 頂層

```
app/(shell)/(dashboard)/dashboard/layout.tsx
  ├── @header/default.tsx    → Header（SidebarTrigger + Breadcrumb）
  └── @modal/                → Dialog overlays（路由攔截）
```

### Workspace 詳情頁

```
app/(shell)/(dashboard)/dashboard/workspaces/[id]/layout.tsx
  ├── @plugin-tab/     → 工作區功能插件
  ├── @modal/          → 攔截路由 Dialog
  └── @panel/          → 右側面板攔截
```

---

## 七、技術棧

| 分類 | 技術 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 語言 | TypeScript 5（strict mode） |
| 後端即服務 | Firebase 11（Firestore、Auth、Storage） |
| AI | Google Genkit + Gemini |
| UI 元件庫 | Shadcn/UI（Radix UI primitives） |
| 樣式 | Tailwind CSS |
| Lint | ESLint 9（flat config） |
| 埠號 | `9002`（開發環境） |
