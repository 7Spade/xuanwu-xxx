# `src/entities/` — Pure Business Models (No Firebase / No React)

Each sub-directory is one domain aggregate. Each `index.ts` exports only pure functions and type guards — no async, no I/O, no React.

```
src/entities/
  account/index.ts    ← isOrganization(), isOwner(), getUserTeamIds(), getMemberRole()
  workspace/index.ts  ← filterVisibleWorkspaces(), hasWorkspaceAccess()
  schedule/index.ts   ← canTransitionScheduleStatus(), VALID_STATUS_TRANSITIONS
  user/index.ts       ← isAnonymousUser()
  index.ts            ← re-exports all domains
```

## Current directory structure

| Module | Responsibility |
|--------|---------------|
| `account/` | Account ownership, role checks, team membership queries |
| `workspace/` | Visibility filtering, access grant resolution |
| `schedule/` | Status transition validation |
| `user/` | Auth user type guards |

## What belongs here

- **Pure functions** that encode a single domain rule (no side effects)
- **Type guards** (`is*`, `has*`, `can*`) derived from domain interfaces
- **Derived constants** computed from domain enums (e.g. valid state transitions)
- **Permission predicates** — all permission logic must live here, not in UI or actions

## What does NOT belong here

- Plain TypeScript interfaces / type aliases → `src/types/domain.ts`
- Firebase read/write operations → `src/infra/`
- Business-level orchestration (multiple entities) → `src/actions/`
- React hooks → `src/hooks/`

## Naming convention

Sub-directories match the domain name. Each exports via `index.ts`.  
All exported functions start with a **verb**: `is*`, `has*`, `can*`, `get*`, `filter*`.

## Allowed imports

```ts
import ... from '@/types/...'  // ✅ domain interfaces as input/output shapes
import ... from '@/lib/...'    // ✅ pure utilities
```

## Forbidden imports

```ts
import ... from '@/infra/...'    // ❌ no Firebase
import ... from '@/actions/...'  // ❌ no orchestration
import ... from '@/hooks/...'    // ❌ no React
import ... from '@/context/...'  // ❌ no React
import ... from 'react'          // ❌ no React
import ... from 'next'           // ❌ no Next.js
```

## Entity migration rules

1. Entity 不得 import `react`、`firebase`、`next`。
2. Entity 不得包含 `async` 函式。
3. Entity 不得讀寫資料庫。
4. Entity 只允許純函式與型別定義。
5. Entity 不得依賴 `actions`。
6. Entity 不得依賴 `infra`。
7. 所有權限判斷必須移入 Entity。
8. 所有狀態轉換規則必須移入 Entity。
9. Entity 變更不得影響 UI 層 import 結構。
10. Entity 不得出現副作用。

## Who depends on this layer

`src/actions/`, `src/hooks/`, `src/context/` — any layer that needs domain rules.
