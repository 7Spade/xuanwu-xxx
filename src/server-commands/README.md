# `src/actions/` — Business Logic Boundary Layer

Pure async functions that sit between React hooks and the infra facade.  
**No React imports. No hooks. No context.** Explicit parameters only.

## Directory structure

Each domain has its own sub-directory with an `index.ts`:

```
src/actions/
  account/index.ts   ← Organization CRUD, teams, member management
  auth/index.ts      ← signIn, registerUser, signOut, resetPassword
  workspace/index.ts ← Workspace lifecycle, access grants, capabilities
  bookmark/index.ts  ← Bookmark add/remove toggle
  daily/index.ts     ← Daily log likes and comments
  issue/index.ts     ← Issue CRUD and comments
  schedule/index.ts  ← Schedule item CRUD, member assignment, status
  storage/index.ts   ← File uploads (photo, attachment, avatar)
  task/index.ts      ← Task CRUD, batch import
  user/index.ts      ← User account creation and profile management
  index.ts           ← re-exports all domains
```

## What belongs here

- One domain per sub-directory; all exports in `index.ts`
- Functions that orchestrate one or more facade calls
- Functions callable from hooks, context providers, or Next.js Server Actions
- Input validation before calling infra

## What does NOT belong here

- Business rules / permission logic → `src/entities/`
- React hooks → `src/hooks/`
- UI components → `src/shared/ui/` or `src/components/`
- Direct Firestore reads/writes (use facade) → `src/infra/`

## Allowed imports

```ts
import ... from '@/infra/...'      // ✅ call the facade
import ... from '@/entities/...'   // ✅ use pure domain rules for input validation
import ... from '@/types/...'      // ✅ domain types
import ... from '@/lib/...'        // ✅ pure utilities
```

## Forbidden imports

```ts
import ... from '@/hooks/...'      // ❌ no React hooks
import ... from '@/context/...'    // ❌ no React context
import ... from 'react'            // ❌ no React
import ... from '@/shared/ui/...'  // ❌ no UI components
import ... from '@/app/...'        // ❌ no app layer
```

## Action migration rules

1. Action 不得包含商業規則。
2. Action 不得直接操作 Firestore。
3. Action 只能呼叫 service 或 repository。
4. Action 不得 import UI。
5. Action 不得依賴 React hook。
6. Action 必須作為唯一 server 邊界。
7. Action 不得返回非序列化物件。
8. Action 不得實作權限邏輯。
9. Action 只負責驗證輸入與調用流程。
10. Action 必須標註 `"use server"`（Firebase Admin SDK 遷移後啟用）。

## Who depends on this layer

`hooks/`, `context/`, `app/` (Server Actions).
