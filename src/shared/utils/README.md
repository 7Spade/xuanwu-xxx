# `src/shared/utils/` — Global Shared Utilities

Pure, stateless helper functions with no side effects. Zero React, zero Firebase.

## Current files

| File | Description |
|------|-------------|
| `utils.ts` | `cn()` (Tailwind merge), `hexToHsl()` — import via `@/shared/utils/utils` |
| `format-bytes.ts` | `formatBytes(bytes)` — human-readable file size |
| `i18n.ts` | `i18nConfig`, `getPreferredLocale`, `loadMessages`, `setLocalePreference` |

## What belongs here

- `cn()` — Tailwind class merging utility (`clsx` + `tailwind-merge`)
- Generic formatting helpers (`formatBytes`, `formatDate`, etc.)
- i18n utility functions
- Other framework-agnostic utilities used across `shared/` and `app/`

## What does NOT belong here

- Firebase SDK calls → `src/infra/`
- Business logic → `src/actions/`
- React hooks → `src/shared/hooks/`
- Domain-specific logic → `src/entities/`

## Naming convention

`{utility-name}.ts` — e.g. `utils.ts`, `format-bytes.ts`, `date.ts`

## Allowed imports

```ts
import ... from '@/types/...'         // ✅
import ... from '@/shared/types/...'  // ✅
```

## Forbidden imports

```ts
import ... from '@/infra/...'    // ❌
import ... from '@/hooks/...'    // ❌
import ... from '@/context/...'  // ❌
import ... from '@/actions/...'  // ❌
import ... from '@/app/...'      // ❌
import ... from 'react'          // ❌
```
