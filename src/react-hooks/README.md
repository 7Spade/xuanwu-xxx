# `src/react-hooks/` — Reusable Logic Layer

Custom React hooks that bridge the UI and lower-level layers.

## Sub-directories

| Directory | Contents |
|-----------|---------|
| `state/` | Hooks that read from / write to context (e.g. `use-app.ts`, `use-user.ts`, `use-account-management.ts`) |
| `actions/` | Hooks wrapping `src/actions/` with React concerns: auth guards, toasts, `useCallback` |
| `infra/` | Hooks wrapping infra services: `use-logger.ts`, `use-storage.ts` |

## Naming convention

`use-{what-it-does}.ts` — always camelCase prefix `use`.  
Never export a hook from a file that does not start with `use-`.

## What belongs here

- Auth guard wrappers around action functions
- Toast/error handling for user-facing write operations
- Real-time Firestore listener hooks
- UI state helpers tied to domain logic (debounce on searches, etc.)

> Pure framework-level UI hooks (`use-mobile`, `use-toast`) moved to `src/shared/hooks/`.

## What does NOT belong here

- Pure business logic with no React dependency → `src/actions/`
- Firebase SDK direct calls → `src/firebase/`
- Global state → `src/react-providers/`

## Allowed imports

```ts
import ... from '@/domain-types/...'    // ✅
import ... from '@/lib/...'      // ✅
import ... from '@/firebase/...'    // ✅
import ... from '@/server-commands/...'  // ✅
import ... from '@/react-providers/...'  // ✅
```

## Forbidden imports

```ts
import ... from '@/app/...'        // ❌
import ... from '@/genkit-flows/...'         // ❌
```

## Who depends on this layer

`context/` providers and `app/` components/pages.
