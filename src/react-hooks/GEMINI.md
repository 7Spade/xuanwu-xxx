# React Hooks Layer (`src/react-hooks/`)

## Role

Custom React hooks that bridge the UI layer and lower-level infrastructure. Provides clean, reusable access to application state and Firebase-backed operations. All hooks are organized by sub-directory purpose.

## Boundary Rules

- 僅封裝 React state 與 effect。
- 可依賴 `server-commands`、`domain-types`、`domain-rules`、`firebase`（僅 real-time listeners）、`react-providers`、`shared`。
- 不得依賴 `use-cases`（禁止上層依賴）。
- 不得依賴 `genkit-flows`（AI 呼叫透過 `server-commands`）。
- 不得依賴 `view-modules`（禁止 UI 元件引用）。
- 不得包含業務規則不變條件（邏輯在 `domain-rules`）。

## Sub-directories

| Directory | File pattern | What it provides |
|-----------|-------------|-----------------|
| `state-hooks/` | `use-*.ts` | Read domain state from `react-providers` — read-only, no side effects |
| `command-hooks/` | `use-*-commands.ts` | Wrap `server-commands` with React concerns: auth guards, toasts, `useCallback` |
| `service-hooks/` | `use-*.ts` | Wrap infra services: logger, storage, daily upload |

## Input / Output Contracts

| Hook pattern | Output | Side effects |
|-------------|--------|-------------|
| `useApp()` | `{ activeAccount, setActiveAccount, ... }` | None — reads context |
| `useAccount()` | `{ workspaces, members, ... }` | None — reads context |
| `use*Commands()` | `{ commandFn: (...) => Promise<void>, isPending }` | Firestore write via server-commands |
| `use*Upload()` | `{ upload: (file) => Promise<void>, isUploading }` | Firebase Storage write |
| `useWorkspaceAudit(id)` | `{ logs: AuditLog[], isLoading }` | Firestore real-time listener |

## Allowed Imports

```ts
import ... from "@/server-commands/..."   // ✅ write operations
import ... from "@/domain-types/..."      // ✅ domain interfaces
import ... from "@/domain-rules/..."      // ✅ pure validation
import ... from "@/firebase/..."          // ✅ onSnapshot real-time listeners ONLY
import ... from "@/react-providers/..."   // ✅ reading context values
import ... from "@/shared/..."            // ✅ utilities, constants
```

## Forbidden Imports

```ts
import ... from "@/genkit-flows/..."      // ❌ AI flows go through server-commands
import ... from "@/use-cases/..."         // ❌ no upward dependency
import ... from "@/view-modules/..."      // ❌ no UI component imports
import ... from "@/app/..."               // ❌ no upward dependency
```

## Naming Conventions

- File: `use-{what-it-does}.ts` (kebab-case)
- Export: `use{WhatItDoes}()` (camelCase with `use` prefix)
- Never export a hook from a file that does not start with `use-`.

## Who Depends on This Layer?

`src/react-providers/` (complex provider logic) and `src/view-modules/` (view components).
