# `src/shared/` — Cross-Layer Shared Utilities (Reserved)

> **Status: Reserved for future use.**  
> Code that is currently shared lives in `src/lib/` (pure utils) or `src/types/` (shared types).  
> This directory is reserved for **non-trivial utilities that are too large or too specific for `src/lib/`** but still need to be shared across multiple feature areas.

## What belongs here (if used)

Utilities and helpers that are:

- Used by **three or more** unrelated layers or features
- Too domain-specific for `src/lib/` (e.g. contain business vocabulary)
- Not tied to any single aggregate (those belong in `src/entities/`)

Examples:

```
src/shared/
  pagination.ts         ← cursor-based pagination helpers shared by hooks + actions
  error-mapping.ts      ← Firebase error code → user-facing message map
  date-range.ts         ← date range arithmetic used by schedule + daily + audit
  constants.ts          ← shared business constants (max members, plan limits)
```

## What does NOT belong here

- Simple one-liner utilities → `src/lib/`
- TypeScript interfaces / type aliases → `src/types/`
- Single-domain logic → `src/actions/{domain}.actions.ts`
- React hooks or components → `src/hooks/` or `src/app/`
- Firebase SDK calls → `src/infra/`

## Naming convention

`{concern}.ts` — e.g. `pagination.ts`, `error-mapping.ts`, `date-range.ts`

No sub-directories unless the concern is large enough to warrant its own folder with an `index.ts`.

## Allowed imports

```ts
import ... from '@/types/...'  // ✅ domain type definitions
import ... from '@/lib/...'    // ✅ lower-level pure utils
```

## Forbidden imports

```ts
import ... from '@/infra/...'    // ❌ no Firebase
import ... from '@/actions/...'  // ❌ no orchestration
import ... from '@/hooks/...'    // ❌ no React
import ... from '@/context/...'  // ❌ no React
import ... from '@/app/...'      // ❌ no app layer
import ... from 'react'          // ❌ no React
```

## Current guidance

Do **not** create files here without first checking:

1. Does `src/lib/utils.ts` already have (or could easily hold) this logic?
2. Is the utility truly needed by **multiple independent areas**, not just one?

If in doubt, start in `src/lib/` and move here only once duplication appears.

## Who depends on this layer

`src/actions/`, `src/hooks/`, `src/context/`, `src/app/` — any layer above `src/lib/`.
