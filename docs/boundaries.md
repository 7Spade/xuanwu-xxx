# 架構邊界 (Architectural Boundaries)

本文件定義系統中各模組之間的明確邊界和依賴規則。

## 核心原則：單向依賴

```
app/  →  features/{name}/index.ts  →  shared/*
```

任何模組只能依賴其「下方」的模組，嚴禁向上或跨切片私有路徑依賴。

---

## 各層職責與邊界

### 1. `shared/types/` — 類型層（Foundation）
- **職責**: 全域 TypeScript 類型定義，無任何邏輯、無任何依賴。
- **邊界**: 零依賴。

### 2. `shared/lib/` — 業務規則層
- **職責**: 純函式業務規則（`filterVisibleWorkspaces`、`buildTaskTree` 等），無 I/O，無框架依賴。
- **邊界**: 只能依賴 `shared/types/`。

### 3. `shared/infra/` — 基礎設施層
- **職責**: Firebase SDK 唯一閘道（Facade + Repository Pattern）。
- **邊界**: 可依賴 `shared/types/`。不了解 React 或任何 UI 概念。

### 4. `shared/ai/` — AI 流程層
- **職責**: Genkit AI 流程（Server-side 唯一）。
- **邊界**: 可依賴 `shared/types/`、`shared/infra/`（讀取 context）。

### 5. `shared/ui/` — UI 原語層
- **職責**: Shadcn/UI primitives、app-providers、常數、i18n。
- **邊界**: `shadcn-ui/` 和 `utility-hooks/` 零業務依賴；`app-providers/` 可依賴 `shared/infra/`（例外：FirebaseProvider 接線）。

### 6. `features/{name}/` — 功能切片層
- **職責**: 業務領域的完整實作（UI、hooks、actions、queries、types）。
- **邊界**:
  - 可依賴所有 `shared/*` 模組。
  - 可依賴其他切片的 `index.ts`（禁止依賴其他切片的 `_` 前綴私有路徑）。
  - 禁止依賴 `app/`。

### 7. `app/` — 路由組裝層（Entry）
- **職責**: Next.js 路由入口，負責組合頁面與佈局。
- **邊界**: 最頂層，只引用 `features/*/index.ts` 和 `shared/*`。**任何其他層都不能依賴 `app/`。**

---

## 切片私有路徑規則

`_` 前綴路徑（`_actions.ts`、`_hooks/`、`_components/`）是切片私有的：

```ts
// ✅ 允許
import { AccountScheduleSection } from "@/features/workspace-governance.schedule";

// ❌ 禁止：直接引用切片私有路徑
import { useWorkspaceSchedule } from "@/features/workspace-governance.schedule/_hooks/use-workspace-schedule";
```

---

## 詳細依賴矩陣

完整允許/禁止 import 清單請參閱 `docs/system-design/dependency-overview.md`。
