# `src/lib/` — Utility Layer

> **Status:** Global utilities have been moved to `src/shared/utils/`.
> This directory now holds only documentation and any future lib-level utilities
> that are not universally shared (e.g. server-only helpers that don't belong in shared/).

## Current files

| File | Status |
|------|--------|
| _(empty — utilities migrated)_ | — |

## What belongs here

- Server-only utility helpers that are **not** needed by client components
- Framework-agnostic helpers that are **specific to the backend/infra layer**

## What does NOT belong here

- `cn()` and Tailwind utilities → `src/shared/utils/utils.ts`
- Formatting helpers (`formatBytes`, etc.) → `src/shared/utils/format-bytes.ts`
- i18n utilities → `src/shared/utils/i18n.ts`
- Firebase SDK calls → `src/infra/`
- Business logic → `src/actions/`
- React-specific helpers → `src/shared/hooks/`

## Naming convention

`{utility-name}.ts` — e.g. `server-utils.ts`, `date.ts`

## Allowed imports

```ts
import ... from '@/types/...'        // ✅ (for type-only imports)
import ... from '@/shared/types/...' // ✅
```

## Forbidden imports

```ts
import ... from '@/infra/...'    // ❌
import ... from '@/hooks/...'    // ❌
import ... from '@/context/...'  // ❌
import ... from '@/actions/...'  // ❌
import ... from '@/app/...'      // ❌
import ... from '@/ai/...'       // ❌
```
