# Dependency Overview

> 本文件列出每一層的允許與禁止 import 清單，並說明 ESLint 如何在 CI 強制執行。
> 架構原則請參閱 [architecture-overview.md](./architecture-overview.md)。
> 互動模式請參閱 [interaction-overview.md](./interaction-overview.md)。

---

## 核心規則：單向依賴

```
domain-types  ←  domain-rules / firebase / genkit-flows / shared
                       ←  server-commands
                                 ←  use-cases / react-hooks / react-providers
                                                    ←  view-modules
                                                               ←  app
```

**禁止任何反向 import。** 違規由 `eslint.config.mts` 的 `no-restricted-imports` 規則捕捉，CI 失敗即阻斷合併。

---

## 各層 Import 規範

### `src/domain-types/`

**職責：** TypeScript 型別定義，無任何邏輯、無任何依賴。

| 允許 | 禁止 |
|------|------|
| `typescript` 內建型別 | 所有 `@/` alias import |
| 相對路徑（同層 barrel） | `react`、`next/*` |

```ts
// ✅ 唯一合法的跨檔案參照形式（同層 barrel re-export）
export * from './account'
export * from './workspace'
```

---

### `src/domain-rules/`

**職責：** 純函式業務規則，無 I/O，無框架。

| 允許 | 禁止 |
|------|------|
| `@/domain-types/...` | `react` |
| 相對路徑（同層） | `@/firebase/...` |
| | `@/server-commands/...` |
| | `@/use-cases/...` |
| | `@/react-hooks/...` |
| | `@/react-providers/...` |
| | `@/view-modules/...` |
| | `@/app/...` |
| | `@/shared/...` |
| | `"use client"` 指令 |

---

### `src/firebase/`

**職責：** Firebase SDK 唯一閘道（Facade + Repository Pattern）。

| 允許 | 禁止 |
|------|------|
| `firebase/*` SDK | `react` |
| `@/domain-types/...` | `@/domain-rules/...` |
| 相對路徑（同層） | `@/server-commands/...` |
| | `@/use-cases/...` |
| | `@/react-hooks/...` |
| | `@/react-providers/...` |
| | `@/view-modules/...` |
| | `@/app/...` |
| | `@/shared/...` |
| | `"use client"` 指令 |

---

### `src/genkit-flows/`

**職責：** Google Genkit AI 流程定義，Server-side 唯一。

| 允許 | 禁止 |
|------|------|
| `genkit/*` SDK | `react` |
| `@/domain-types/...`（type import 僅限） | `@/domain-rules/...` |
| `@/firebase/...`（讀取 context 用） | `@/server-commands/...` |
| | `@/use-cases/...` |
| | `@/react-hooks/...` |
| | `@/react-providers/...` |
| | `@/shared/...` |
| | `@/view-modules/...` |
| | `@/app/...` |
| | `"use client"` 指令 |

---

### `src/server-commands/`

**職責：** Firebase 操作封裝（Next.js Server Actions）。無 React，無業務規則。

| 允許 | 禁止 |
|------|------|
| `@/firebase/...` | `react`（含任何 hook） |
| `@/genkit-flows/...` | `@/shared/shadcn-ui/...` |
| `@/domain-rules/...` | `@/shared/app-providers/...` |
| `@/domain-types/...` | `@/shared/utility-hooks/...` |
| `@/shared/utils/...` | `@/use-cases/...` |
| `@/shared/constants/...` | `@/react-hooks/...` |
| `@/shared/i18n-types/...` | `@/react-providers/...` |
| | `@/view-modules/...` |
| | `@/app/...` |
| | `"use client"` 指令 |

---

### `src/use-cases/`

**職責：** 應用層編排（≥2 個 server-command 的組合）。無 React 狀態。

| 允許 | 禁止 |
|------|------|
| `@/server-commands/...` | `@/firebase/...`（必須透過 server-commands） |
| `@/domain-rules/...` | `@/genkit-flows/...` |
| `@/domain-types/...` | `@/react-hooks/...` |
| `@/shared/...` | `@/react-providers/...` |
| `@/view-modules/...`（僅 re-export 用） | `@/app/...` |

> **注意：** `use-cases` 可 import `view-modules` 是為了 view-bridge re-export 模式。  
> 任何包含 `React.useState` / `useEffect` 等的程式碼**不得**在 `use-cases` 中出現。

---

### `src/react-providers/`

**職責：** React Context Providers，Firestore 實時監聽狀態容器。

| 允許 | 禁止 |
|------|------|
| `react` | `@/domain-rules/...`（必須透過 react-hooks） |
| `@/react-hooks/...` | `@/genkit-flows/...` |
| `@/firebase/...`（`onSnapshot` 監聽僅限） | `@/use-cases/...` |
| `@/domain-types/...` | `@/server-commands/...` |
| `@/shared/...` | `@/view-modules/...` |
| | `@/app/...` |

---

### `src/react-hooks/`

**職責：** React Hooks（狀態讀取、指令封裝、服務封裝）。

| 允許 | 禁止 |
|------|------|
| `react` | `@/genkit-flows/...`（AI 呼叫透過 server-commands） |
| `@/server-commands/...` | `@/use-cases/...` |
| `@/domain-types/...` | `@/view-modules/...` |
| `@/domain-rules/...` | `@/app/...` |
| `@/firebase/...`（`onSnapshot` 實時監聽僅限） | |
| `@/react-providers/...` | |
| `@/shared/...` | |

---

### `src/view-modules/`

**職責：** 功能 UI 模組，可組合的 React 元件。

| 允許 | 禁止 |
|------|------|
| `react` | `@/firebase/...`（透過 react-hooks 或 server-commands） |
| `@/react-hooks/...` | `@/genkit-flows/...` |
| `@/react-providers/...` | `@/use-cases/...`（循環依賴）|
| `@/server-commands/...` | `@/app/...` |
| `@/domain-types/...` | |
| `@/domain-rules/...` | |
| `@/shared/...` | |

---

### `src/app/`

**職責：** Next.js App Router 路由組裝，純 UI 組合層。

| 允許 | 禁止（除非有充分理由） |
|------|------|
| `react` / `next/*` | `@/firebase/...`（直接呼叫） |
| `@/view-modules/...` | `@/genkit-flows/...` |
| `@/react-hooks/...` | `@/server-commands/...`（應在 view-modules 或 hooks 中）|
| `@/react-providers/...` | `@/use-cases/...`（應在 view-modules 中）|
| `@/shared/...` | `@/domain-rules/...` |
| `@/domain-types/...`（type import） | |

---

### `src/shared/`

**職責：** 跨層工具，不含任何業務邏輯。

| 允許 | 禁止（`app-providers/` 除外）|
|------|------|
| `react` / `next/*`（部分子目錄） | `@/firebase/...` |
| `@/domain-types/...`（type import） | `@/domain-rules/...` |
| | `@/server-commands/...` |
| | `@/react-hooks/...` |
| | `@/react-providers/...` |
| | `@/genkit-flows/...` |
| | `@/use-cases/...` |
| | `@/view-modules/...` |
| | `@/app/...` |

> **例外：** `shared/app-providers/` 可 import `@/firebase/...` 用於 `FirebaseProvider` 的基礎設施接線（ESLint `ignores` 規則）。

---

## ESLint 強制執行細節

### 工具鏈

`eslint.config.mts` 使用以下 7 個 plugin：

| Plugin | 用途 |
|--------|------|
| `@eslint/js` | JS 基礎規則（recommended） |
| `typescript-eslint` | TypeScript 型別感知規則 |
| `@next/eslint-plugin-next` | Next.js Core Web Vitals |
| `eslint-plugin-react` | React 最佳實踐 |
| `eslint-plugin-react-hooks` | hooks 規則（exhaustive-deps）|
| `eslint-plugin-jsx-a11y` | 無障礙（strict mode）|
| `eslint-plugin-import` | import 排序與路徑規則 |

### 關鍵規則一覽

| 規則 | 嚴重度 | 說明 |
|------|--------|------|
| `no-restricted-imports` | error | 每個層級獨立設定禁止 import（11 個 block）|
| `no-explicit-any` | error | 禁止 `any` 型別 |
| `no-unused-vars` | error | 禁止未使用變數 |
| `consistent-type-imports` | error | 全域強制 `import type` |
| `no-relative-parent-imports` | warn | 禁止 `../` 相對路徑（應用 `@/` alias）|
| `no-restricted-syntax` | error | 禁止在伺服器層使用 `"use client"` |
| `exhaustive-deps` | warn | useEffect 依賴陣列完整性 |
| `no-misused-promises` | error | 禁止在非 async 回調傳入 Promise |
| `strict-boolean-expressions` | warn | 嚴格布林表達式 |

### 執行方式

```bash
# 執行完整 lint
npm run lint

# 執行型別檢查
npm run typecheck
```

---

## 路徑別名（`@/` Alias）

所有跨目錄 import 一律使用 `@/` alias，對應 `src/`：

```ts
// ✅ 正確
import { ScheduleItem } from '@/domain-types/schedule'
import { approveScheduleItem } from '@/server-commands/schedule'

// ❌ 錯誤（相對路徑會觸發 no-relative-parent-imports warn）
import { ScheduleItem } from '../../domain-types/schedule'
```

Alias 設定位置：`tsconfig.json` 的 `paths` 欄位 + `next.config.ts`。
