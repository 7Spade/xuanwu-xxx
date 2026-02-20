# `src/context/` — State Management Layer

React Context providers that hold global or shared application state.

## Context hierarchy (innermost depends on outermost)

```
FirebaseProvider
  └── AuthProvider
        └── AppProvider          ← accounts list, activeAccount
              └── AccountProvider ← workspaces, logs, schedule for activeAccount
                    └── WorkspaceProvider ← single workspace detail (tasks, issues)
```

## What belongs here

- Context files: `{name}-context.tsx`
- Each file exports: a `Context` object + a `Provider` component
- Access helpers live in `src/hooks/state/use-{name}.ts` (not here)

## What does NOT belong here

- Business logic → `src/actions/`
- Firebase SDK calls → `src/infra/` (called via actions or hooks)
- Component rendering → `src/app/` or component trees

## Allowed imports

```ts
import ... from '@/types/...'    // ✅
import ... from '@/lib/...'      // ✅
import ... from '@/infra/...'    // ✅ (for real-time listeners)
import ... from '@/hooks/...'    // ✅
import ... from '@/actions/...'  // ✅
```

## Forbidden imports

```ts
import ... from '@/components/...' // ❌
import ... from '@/ai/...'         // ❌
import ... from '@/app/...'        // ❌
```

## Who depends on this layer

`hooks/state/`, `app/` (via provider wrappers in layouts).
