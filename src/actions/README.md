# `src/actions/` — Business Logic Layer

Pure async functions that sit between React hooks and the infra facade.  
**No React imports. No hooks. No context.** Explicit parameters only.

## What belongs here

- One file per domain: `{domain}.actions.ts`
- Functions that orchestrate one or more facade calls (e.g. `toggleBookmark` decides add vs. remove)
- Functions called by hooks, context providers, or future Next.js Server Actions

## Current files

| File | Domain |
|------|--------|
| `user.actions.ts` | User account creation and profile management |
| `account.actions.ts` | Organization CRUD, teams, member management |
| `workspace.actions.ts` | Workspace lifecycle, access grants, capabilities |
| `task.actions.ts` | Workspace task CRUD |
| `issue.actions.ts` | Workspace issues and comments |
| `schedule.actions.ts` | Schedule items, member assignment, status updates |
| `daily.actions.ts` | Daily log likes and comments |
| `bookmark.actions.ts` | User bookmark add/remove |

## Allowed imports

```ts
import ... from '@/infra/...'   // ✅ call the facade
import ... from '@/types/...'   // ✅ domain types
import ... from '@/lib/...'     // ✅ pure utilities
```

## Forbidden imports

```ts
import ... from '@/hooks/...'   // ❌
import ... from '@/context/...' // ❌
import ... from 'react'         // ❌
```

## Who depends on this layer

`hooks/`, `context/`, and Next.js Server Actions.
