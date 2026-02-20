# React Providers Layer (`src/react-providers/`)

## Role

React Context providers and global state containers. Acts as the bridge between infrastructure (Firebase real-time listeners) and the UI layer. Provides typed context values consumed by hooks and view-modules.

## Boundary Rules

- 僅提供 Context 與全域狀態容器。
- 可依賴 `react-hooks`、`firebase`（real-time listeners）、`domain-types`、`shared`。
- 不得包含業務流程（邏輯在 `use-cases` 或 `domain-rules`）。
- 不得直接依賴 `domain-rules`（必須透過 `react-hooks`）。
- 不得依賴 `use-cases`（禁止上層依賴）。
- 不得依賴 `genkit-flows`（AI 呼叫透過 `server-commands`）。
- 不得依賴 `view-modules`（禁止 UI 元件引用）。

## Provider Hierarchy

```
FirebaseProvider     ← raw Firebase SDK instances
AuthProvider         ← current authenticated user
AppProvider          ← active account, account list
AccountProvider      ← detailed account data (workspaces, members)
WorkspaceProvider    ← single workspace detailed state
```

Context objects are in `*-context.ts`; Provider render logic is in `*-provider.tsx`.

## Allowed Imports

```ts
import ... from "@/react-hooks/..."       // ✅ complex hook logic
import ... from "@/firebase/..."          // ✅ onSnapshot real-time listeners
import ... from "@/domain-types/..."      // ✅ typed context values
import ... from "@/shared/..."            // ✅ utilities, constants
```

## Forbidden Imports

```ts
import ... from "@/domain-rules/..."      // ❌ must go through react-hooks
import ... from "@/genkit-flows/..."      // ❌ no AI calls
import ... from "@/use-cases/..."         // ❌ no upward dependency
import ... from "@/view-modules/..."      // ❌ no UI components
import ... from "@/app/..."               // ❌ no upward dependency
```

## Side Effects

Providers set up Firebase `onSnapshot` listeners on mount and clean them up on unmount. Context values change in response to real-time data updates.

## Who Depends on This Layer?

`src/react-hooks/state-hooks/` (consume context values) and `src/view-modules/` (consume context via hooks).
