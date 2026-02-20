# Project: Feature Layer (`src/features/`)

## Responsibility

Two complementary patterns live in this layer:

### A. Use-case orchestration (`{domain}/index.ts`)

Multi-step domain workflows that call more than one action or infra function.  
No React. No UI. No framework dependencies.

| Module | What it provides |
|--------|-----------------|
| `auth/` | `completeRegistration` — register auth user + create account profile |
| `workspace/` | `createWorkspaceWithCapabilities` — create + mount initial capabilities |
| `account/` | `setupOrganizationWithTeam` — create org + initial team in sequence |
| `schedule/` | `approveScheduleItem`, `rejectScheduleItem` — validate transition + update status |

### B. View components (`{domain}/*-view.tsx`)

"Thick feature, thin page" — full business UI extracted from `src/app` pages.  
Each view is a Client Component (`"use client"`) that owns state and mutations.  
The corresponding `app/` page becomes a 3-line RSC wrapper.

| File pattern | Role |
|---|---|
| `{domain}/*-view.tsx` | `"use client"` — all state, hooks, mutations |
| `{domain}/*-loader.tsx` | RSC — fetches data server-side, passes to view |
| `{domain}/*-skeleton.tsx` | Loading fallback for `<Suspense>` |
| `{domain}/index.ts` | Barrel — exports orchestration functions AND view components |

**Current view modules:** `members/`, `teams/`, `partners/`, `user-settings/`

---

## Dependency rules

### Allowed
- `@/entities/` — use pure domain rules (validation, permission checks)
- `@/infra/` — call facade or repositories for data access
- `@/actions/` — compose existing action functions
- `@/types/` — domain interfaces
- `@/lib/` — pure utilities
- `react` — **only** in `*-view.tsx` and `*-loader.tsx` files
- `@/shared/ui/` — **only** in `*-view.tsx` files
- `@/hooks/` — **only** in `*-view.tsx` files
- `@/context/` — **only** in `*-view.tsx` files

### Forbidden for `index.ts` (orchestration)
- `react`, `firebase`, `next` — no framework dependencies
- `@/hooks/` — no React hook calls
- `@/context/` — no React context reads
- `@/shared/ui/` — no UI components
- `@/app/` — no app layer

### Forbidden for ALL files
- `@/app/` — no app layer imports

## Coding constraints

### Orchestration functions
1. **Multi-step only** — if a function only calls one infra function, it belongs in `actions/`.
2. **No business rules inline** — validation and permission checks belong in `@/entities/`.
3. **Async everywhere** — all exports are async functions.
4. **Explicit parameters** — no global state reads; every dependency is a parameter.
5. **Verb-prefixed exports** — all exported functions start with a verb: `create*`, `complete*`, `approve*`, `setup*`.

### View components
1. **`"use client"` required** — view files must be Client Components.
2. **No direct infra calls** — use `@/actions/` or `@/hooks/` for data mutations.
3. **Props for initial data** — accept `initialData` props for RSC hydration.
4. **Exported named function** — export as named (not default) function.

## Feature migration rules

1. Feature 不得 import `@/app/`。
2. `index.ts` 不得 import `react`、`firebase`、`next`。
3. Feature 必須組合多個 action 或 infra 呼叫。
4. Feature 不得包含商業規則（移入 entity）。
5. `*-view.tsx` 不得 import `@/app/`。
6. Feature 必須有明確的 index.ts 入口。
7. 每個 domain 獨立資料夾。
8. Feature 變更不得影響 UI 層 import 結構。
9. 不得保留舊路徑作為過渡層。

## Migration order (when moving code here)

1. 先抽 Entity — extract pure logic first.
2. 再建立 Feature — extract multi-step orchestration from hooks/context.
3. 再改寫 Action — thin action calls feature instead of infra directly.
4. 最後改寫 UI — move view component to `*-view.tsx`, make page a thin RSC wrapper.
5. 每次只移動一個 domain — never refactor multiple domains simultaneously.
6. 每次遷移後必須確保 import 無跨層循環.

## Dependency direction (absolute)

```
app / context / hooks
       ↓
  src/actions/    ← thin server boundary
       ↓
  src/features/   ← orchestration + view components
       ↓         ↘
src/entities/   src/infra/
```

- **features → app** ❌ forbidden
- **entities → features** ❌ forbidden
- **infra → features** ❌ forbidden

## Ideal end state

> Feature 負責流程與視圖 · Entity 負責規則 · Action 負責邊界 · App 無邏輯
