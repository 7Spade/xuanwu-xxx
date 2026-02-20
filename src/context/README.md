# `src/context/` — Domain State Management Layer

React Context providers that hold **domain or application-level** state.

> Global infrastructure providers (theme, i18n, auth, Firebase) have moved to  
> **`src/shared/context/`** — import them from `@/shared/context/…` instead.

## Context hierarchy (innermost depends on outermost)

```
── src/shared/context ──
FirebaseProvider          ← Firebase SDK instances
  └── AuthProvider        ← Firebase Auth session
        └── ThemeProvider ← dark / light mode
        └── I18nProvider  ← translations

── src/context ────────
AppProvider               ← accounts list, activeAccount
  └── AccountProvider     ← workspaces, logs, schedule for activeAccount
        └── WorkspaceProvider ← single workspace detail (tasks, issues)
```

## What belongs here

- Domain context files: `{name}-context.tsx`
- Each file exports: a `Context` object + a `Provider` component
- Access helpers live in `src/hooks/state/use-{name}.ts` (not here)

## What does NOT belong here

- Global/infrastructure providers → `src/shared/context/`
- Business logic → `src/actions/`
- Firebase SDK calls → `src/infra/` (called via actions or hooks)
- Component rendering → `src/app/` or component trees

## Allowed imports

```ts
import ... from '@/types/...'          // ✅
import ... from '@/lib/...'            // ✅
import ... from '@/infra/...'          // ✅ (for real-time listeners)
import ... from '@/hooks/...'          // ✅
import ... from '@/server-commands/...'        // ✅
import ... from '@/shared/context/...' // ✅ (FirebaseProvider, AuthProvider)
```

## Forbidden imports

```ts
import ... from '@/genkit-flows/...'   // ❌
import ... from '@/app/...'  // ❌
```

## Who depends on this layer

`hooks/state/`, `app/` (via provider wrappers in layouts).
