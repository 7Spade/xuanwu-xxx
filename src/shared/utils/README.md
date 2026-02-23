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

- Firebase SDK calls → `@/shared/infra/`
- Business logic → `features/{slice}/_actions.ts`
- React hooks → `features/{slice}/_hooks/`
- Domain-specific logic → `features/{slice}/`

## Naming convention

`{utility-name}.ts` — e.g. `utils.ts`, `format-bytes.ts`, `date.ts`

## Allowed imports

```ts
import ... from '@/shared/types'            // ✅ domain types
import ... from '@/shared/i18n-types/...'  // ✅
```

## Forbidden imports

```ts
import ... from '@/features/...'        // ❌
import ... from '@/shared/infra/...'    // ❌
import ... from '@/shared/ai/...'       // ❌
import ... from '@/app/...'             // ❌
import ... from 'react'                 // ❌
```
