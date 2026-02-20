# `src/features/` — Use-Case Orchestration Layer

Each sub-directory is one domain use case. Each `index.ts` exports only async orchestration functions — no React, no UI, no framework side effects.

```
src/features/
  auth/index.ts       ← completeRegistration()
  workspace/index.ts  ← createWorkspaceWithCapabilities()
  account/index.ts    ← setupOrganizationWithTeam()
  schedule/index.ts   ← approveScheduleItem(), rejectScheduleItem()
  index.ts            ← re-exports all domains
```

## Current directory structure

| Module | Responsibility |
|--------|---------------|
| `auth/` | Multi-step auth flows: register auth user + create Firestore account profile |
| `workspace/` | Workspace setup: create + mount capabilities in one call |
| `account/` | Organization setup: create org + initial team |
| `schedule/` | Schedule status transitions: validate via entity + update via infra |

## What belongs here

- **Multi-step orchestrations** that call more than one action or infra function
- **Use-case flows** that combine entity validation with infra writes
- Functions callable from hooks, context providers, or Server Actions

## What does NOT belong here

- Single-call infra wrappers → `src/actions/`
- Pure domain logic (no I/O) → `src/entities/`
- React hooks → `src/hooks/`
- UI components → `src/shared/ui/` or `src/components/`
- Plain TypeScript interfaces → `src/types/domain.ts`

## Naming convention

Sub-directories match the domain name. Each exports via `index.ts`.  
All exported functions start with a **verb**: `create*`, `complete*`, `approve*`, `reject*`, `setup*`.

## Allowed imports

```ts
import ... from '@/domain-rules/...'  // ✅ domain rules and validation
import ... from '@/infra/...'     // ✅ data access via facade
import ... from '@/server-commands/...'   // ✅ compose existing actions
import ... from '@/types/...'     // ✅ domain types
import ... from '@/lib/...'       // ✅ pure utilities
```

## Forbidden imports

```ts
import ... from '@/hooks/...'      // ❌ no React hooks
import ... from '@/context/...'    // ❌ no React context
import ... from 'react'            // ❌ no React
import ... from '@/shared/ui/...'  // ❌ no UI components
import ... from '@/app/...'        // ❌ no app layer
```

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

## Who depends on this layer

`src/actions/`, `src/hooks/`, `src/context/` — any layer that needs multi-step orchestration.
