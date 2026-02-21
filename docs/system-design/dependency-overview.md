# Dependency Overview

> 本文件列出 VSA 各層的允許與禁止 import 規則。
> 架構原則請參閱 [architecture-overview.md](./architecture-overview.md)。

---

## 核心規則：單向依賴

```
app/  →  features/{name}/index.ts  →  shared/*
```

**禁止任何反向 import。** 違規由 `eslint.config.mts` 的 `no-restricted-imports` 規則在 CI 強制執行。

---

## `src/app/`

**職責：** Next.js App Router 路由組裝，純 UI 組合層。

| 允許 | 禁止 |
|------|------|
| `@/features/*`（僅透過 `index.ts`） | `@/features/*/_*`（切片私有路徑） |
| `@/shared/*` | 直接 import shared/infra（應由 features 封裝） |
| `react` / `next/*` | |

---

## `src/features/{name}/`

**職責：** 業務領域的完整實作（切片私有，不跨切片共享內部）。

| 允許 | 禁止 |
|------|------|
| `@/shared/types` | `@/features/{other}/_*`（其他切片私有路徑） |
| `@/shared/lib` | `@/app/*` |
| `@/shared/infra` | |
| `@/shared/ai` | |
| `@/shared/ui` | |
| `@/features/{other}`（僅透過 index.ts） | |
| 切片內相對路徑（同切片間） | |

---

## `src/shared/types/`

**職責：** TypeScript 領域類型定義，無任何邏輯。

| 允許 | 禁止 |
|------|------|
| TypeScript 內建型別 | 所有 `@/` import |
| 同層相對路徑（barrel re-export） | `react`、`next/*` |

---

## `src/shared/lib/`

**職責：** 純函式業務規則，無 I/O，無框架依賴。

| 允許 | 禁止 |
|------|------|
| `@/shared/types` | `react` |
| 同層相對路徑 | `@/shared/infra` |
| | `@/shared/ai` |
| | `@/features/*` |
| | `@/app/*` |

---

## `src/shared/infra/`

**職責：** Firebase SDK 唯一閘道（Facade + Repository Pattern）。

| 允許 | 禁止 |
|------|------|
| `firebase/*` SDK | `react` |
| `@/shared/types` | `@/features/*` |
| 同層相對路徑 | `@/app/*` |
| | `@/shared/ai` |

---

## `src/shared/ai/`

**職責：** Google Genkit AI 流程定義，Server-side 唯一。

| 允許 | 禁止 |
|------|------|
| `genkit/*` SDK | `react` |
| `@/shared/types`（type import） | `@/features/*` |
| `@/shared/infra`（讀取 context） | `@/app/*` |

---

## `src/shared/ui/`

**職責：** UI 原語（Shadcn、Providers、常數、i18n）。不含任何業務邏輯。

| 子目錄 | 允許 | 禁止 |
|--------|------|------|
| `shadcn-ui/` | `react`、`@/shared/types` | `@/features/*`、`@/shared/infra` |
| `app-providers/` | `react`、`@/shared/infra`（例外：FirebaseProvider 接線） | `@/features/*`、`@/app/*` |
| `constants/` | 純常數 | 所有依賴 |
| `utility-hooks/` | `react` | `@/features/*`、`@/shared/infra` |

---

## ESLint 強制執行

### 工具鏈（7 plugins）

| Plugin | 用途 |
|--------|------|
| `@eslint/js` | JS 基礎規則 |
| `typescript-eslint` | TypeScript 型別感知規則 |
| `@next/eslint-plugin-next` | Next.js Core Web Vitals |
| `eslint-plugin-react` | React 最佳實踐 |
| `eslint-plugin-react-hooks` | hooks 規則（exhaustive-deps） |
| `eslint-plugin-jsx-a11y` | 無障礙（strict mode） |
| `eslint-plugin-import` | import 排序與路徑規則 |

### 關鍵規則

| 規則 | 嚴重度 | 說明 |
|------|--------|------|
| `no-restricted-imports` | error | VSA 邊界規則（禁止 import 切片私有路徑） |
| `no-explicit-any` | error | 禁止 `any` 型別 |
| `no-unused-vars` | error | 禁止未使用變數 |
| `consistent-type-imports` | error | 全域強制 `import type` |
| `no-relative-parent-imports` | warn | 禁止 `../` 相對路徑（應用 `@/` alias） |
| `exhaustive-deps` | warn | useEffect 依賴陣列完整性 |
| `no-misused-promises` | error | 禁止在非 async 回調傳入 Promise |

```bash
# 執行 lint
npm run lint

# 執行型別檢查
npm run typecheck
```

---

## 路徑別名（`@/` Alias）

所有跨目錄 import 一律使用 `@/` alias，對應 `src/`：

```ts
// ✅ 正確
import { ScheduleItem } from "@/shared/types";
import { AccountScheduleSection } from "@/features/workspace-governance.schedule";

// ❌ 錯誤（相對路徑）
import { ScheduleItem } from "../../shared/types/schedule.types";

// ❌ 禁止（切片私有路徑）
import { useWorkspaceSchedule } from "@/features/workspace-governance.schedule/_hooks/use-workspace-schedule";
```
