# Project: Feature Layer (`src/features/`)

## Responsibility

Use-case orchestration — coordinates entities and infra calls for multi-step domain workflows.  
No React. No UI. No framework dependencies.  
Each sub-directory is one domain use case; each `index.ts` contains only async orchestration functions.

## Directory map

| Module | What it provides |
|--------|-----------------|
| `auth/` | `completeRegistration` — register auth user + create account profile |
| `workspace/` | `createWorkspaceWithCapabilities` — create + mount initial capabilities |
| `account/` | `setupOrganizationWithTeam` — create org + initial team in sequence |
| `schedule/` | `approveScheduleItem`, `rejectScheduleItem` — validate transition + update status |
| `index.ts` | re-exports all of the above |

## Dependency rules

### Allowed
- `@/entities/` — use pure domain rules (validation, permission checks)
- `@/infra/` — call facade or repositories for data access
- `@/actions/` — compose existing action functions
- `@/types/` — domain interfaces
- `@/lib/` — pure utilities

### Forbidden
- `react`, `firebase`, `next` — no framework dependencies
- `@/hooks/` — no React hook calls
- `@/context/` — no React context reads
- `@/shared/ui/` — no UI components
- `@/app/` — no app layer

## Coding constraints

1. **Multi-step orchestration only** — if a function only calls one infra function, it belongs in `actions/`.
2. **No business rules inline** — all validation and permission checks belong in `@/entities/`.
3. **Async everywhere** — all exports are async functions.
4. **Explicit parameters** — no global state reads; every dependency is a parameter.
5. **One domain per module** — each sub-directory encapsulates one domain use case.
6. **No React dependencies** — callable from Server Actions, scripts, and tests.
7. **Verb-prefixed exports** — all exported functions start with a verb: `create*`, `complete*`, `approve*`, `setup*`.

## Feature migration rules

1. Feature 不得 import `react`、`firebase`、`next`。
2. Feature 必須組合多個 action 或 infra 呼叫。
3. Feature 不得包含商業規則（移入 entity）。
4. Feature 不得依賴 React hook。
5. Feature 不得 import UI。
6. Feature 不得返回非序列化物件。
7. Feature 必須有明確的 index.ts 入口。
8. 每個 domain 獨立資料夾。
9. Feature 變更不得影響 UI 層 import 結構。
10. 不得保留舊路徑作為過渡層。

## Migration order (when moving code here)

1. 先抽 Entity — extract pure logic first.
2. 再建立 Feature — extract multi-step orchestration from hooks/context.
3. 再改寫 Action — thin action calls feature instead of infra directly.
4. 最後改寫 UI — UI adjusts last.
5. 每次只移動一個 domain — never refactor multiple domains simultaneously.
6. 每次遷移後必須確保 import 無跨層循環.

## Dependency direction (absolute)

```
app / context / hooks
       ↓
  src/actions/    ← thin server boundary
       ↓
  src/features/   ← multi-step use cases
       ↓         ↘
src/entities/   src/infra/
```

- **features → UI** ❌ forbidden
- **features → hooks** ❌ forbidden
- **features → app** ❌ forbidden
- **entities → features** ❌ forbidden
- **infra → features** ❌ forbidden

## Ideal end state

> Feature 負責流程 · Entity 負責規則 · Action 負責邊界 · UI 無邏輯
