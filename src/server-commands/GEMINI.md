# Project: Action Layer (`src/actions/`)

## Responsibility

Server boundary — orchestrates infra calls.  
No business rules. No React. No UI.  
Pure async functions with explicit parameters.

## Directory map

| Module | What it provides |
|--------|-----------------|
| `account/` | Organization CRUD, teams, members |
| `auth/` | signIn, registerUser, signOut, resetPassword |
| `workspace/` | Workspace lifecycle, grants, capabilities |
| `bookmark/` | Bookmark add/remove toggle |
| `daily/` | Daily log likes and comments |
| `issue/` | Issue CRUD and comments |
| `schedule/` | Schedule item CRUD, member assignment |
| `storage/` | File uploads (photo, attachment, avatar) |
| `task/` | Task CRUD, batch import |
| `user/` | User account creation and profile management |
| `index.ts` | re-exports all domains |

## Dependency rules

### Allowed
- `@/infra/` — call facade or repositories
- `@/entities/` — use pure domain rules for input validation
- `@/types/` — domain types
- `@/lib/` — pure utilities

### Forbidden
- `react` — no React hooks or context
- `@/hooks/` — no hook calls
- `@/context/` — no context reads
- `@/shared/ui/` — no UI components
- `@/app/` — no app layer

## Coding constraints

1. **呼叫 service 或 repository** — actions must call infra; never touch Firestore directly.
2. **不得包含商業規則** — business rules (permission checks, state validation) belong in `@/entities/`.
3. **不得實作權限邏輯** — all `isOwner` / `hasAccess` checks must be in `@/entities/`.
4. **不得依賴 React hook** — actions must be callable outside React (Server Actions, scripts, tests).
5. **不得 import UI** — zero dependency on any component or visual layer.
6. **不得返回非序列化物件** — return value must be JSON-serializable (string, number, void, plain object/array).
7. **只負責驗證輸入與調用流程** — validate inputs, resolve entities, call infra, return result.
8. **`"use server"` (目標)** — actions are the unique server boundary; mark with `"use server"` once Firebase Admin SDK migration is complete.

## Action migration rules

1. Action 必須標註 `"use server"`（Firebase Admin SDK 後啟用）。
2. Action 不得包含商業規則。
3. Action 不得直接操作 Firestore。
4. Action 只能呼叫 service 或 repository。
5. Action 不得 import UI。
6. Action 不得依賴 React hook。
7. Action 必須作為唯一 server 邊界。
8. Action 不得返回非序列化物件。
9. Action 不得實作權限邏輯。
10. Action 只負責驗證輸入與調用流程。

## Migration order

1. Entity extracted first.
2. Business rules moved to entity.
3. Action simplified to: validate → call infra → return.
4. Callers (hooks / context) updated last.
5. Never refactor multiple domains simultaneously.
6. Verify zero circular imports after each migration.
7. Do not create temporary helper shims.
8. Do not keep old paths as transition layers.

## Dependency direction (absolute)

```
app / context / hooks
       ↓
  src/actions/   ← pure async, no React, explicit params
       ↓
infra/facade → repositories
```

- **actions → UI** ❌ forbidden
- **actions → hooks** ❌ forbidden
- **features → app** ❌ forbidden
- **infra → features** ❌ forbidden
