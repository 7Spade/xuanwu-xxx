# Application Entry Layer (`src/app/`)

## Role

Root of the Next.js App Router. **Pure UI composition layer** — assembles views from `view-modules/`, mounts context providers, and declares route structure. Contains no business logic.

## Boundary Rules

- 僅負責路由組裝、頁面組合與 Provider 掛載。
- 可依賴 `view-modules`、`react-providers`、`react-hooks`、`server-commands`、`shared`、`domain-types`。
- 不得直接依賴 `domain-rules`（必須透過 `use-cases` 或 `react-hooks`）。
- 不得直接操作 `firebase` 或 `genkit-flows`。

## Allowed Files per Route Folder

`layout.tsx` · `page.tsx` · `loading.tsx` · `error.tsx` · `default.tsx`

Parallel-route slots: `@slotName/` convention (`@sidebar/`, `@header/`, `@modal/`, `@panel/`, `@plugin-tab/`).

## Allowed Imports

```ts
import ... from "@/view-modules/..."      // ✅ feature UI views
import ... from "@/react-providers/..."   // ✅ context providers (WorkspaceProvider, etc.)
import ... from "@/react-hooks/..."       // ✅ command / state hooks
import ... from "@/server-commands/..."   // ✅ server actions for mutations
import ... from "@/shared/..."            // ✅ shadcn-ui, utility-hooks, constants
import ... from "@/domain-types/..."      // ✅ type definitions only
```

## Forbidden Imports

```ts
import ... from "@/domain-rules/..."     // ❌ must go through react-hooks or use-cases
import ... from "@/firebase/..."          // ❌ must go through react-hooks or server-commands
import ... from "@/genkit-flows/..."      // ❌ server-side AI; call via server-commands
import ... from "@/use-cases/..."         // ❌ orchestration belongs in react-hooks or view-modules
```

## Side Effects

Route files may trigger navigation (`redirect`, `router.push`) and mount React providers. No Firebase writes in route files directly.

## Who Depends on This Layer?

**No one.** `src/app/` is the top of the dependency graph.
