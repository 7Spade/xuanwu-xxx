# Application Entry Layer (`src/app/`)

## Role

Root of the Next.js App Router. **Pure UI composition layer** — assembles views from `features/`, mounts context providers, and declares route structure. Contains no business logic.

## Boundary Rules

- 僅負責路由組裝、頁面組合與 Provider 掛載。
- 可依賴 `features/*/index.ts`（公開 API）與 `shared/`。
- 不得撰寫業務邏輯（必須透過 `features/*/index.ts`）。
- 不得直接操作 `shared/infra/` 或 `shared/ai/`。

## Allowed Files per Route Folder

`layout.tsx` · `page.tsx` · `loading.tsx` · `error.tsx` · `default.tsx`

Parallel-route slots: `@slotName/` convention (`@sidebar/`, `@header/`, `@modal/`, `@panel/`, `@businesstab/`).

## Allowed Imports

```ts
import ... from "@/features/{slice}"       // ✅ feature public API (index.ts only)
import ... from "@/shared/ui/..."          // ✅ shadcn-ui, app-providers, i18n
import ... from "@/shared/types"           // ✅ type definitions only
import ... from "@/shared/lib"             // ✅ pure utilities (cn, formatBytes, …)
```

## Forbidden Imports

```ts
import ... from "@/features/{slice}/_..."  // ❌ never import slice-private paths
import ... from "@/shared/infra/..."       // ❌ infra is accessed only from features/_actions.ts
import ... from "@/shared/ai/..."          // ❌ AI flows are server-only, called from features/_actions.ts
```

## Side Effects

Route files may trigger navigation (`redirect`, `router.push`) and mount React providers. No Firebase writes in route files directly.

## Who Depends on This Layer?

**No one.** `src/app/` is the top of the dependency graph.
