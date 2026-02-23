# `src/shared/types/` — Global Shared Types

Types that are globally shared across client layers (UI, hooks, contexts).

## Current files

| File | Description |
|------|-------------|
| `i18n.schema.ts` | `TranslationMessages` interface — all UI string keys |
| `i18n.ts` | `Locale`, `I18nConfig` types |

## What belongs here

- i18n types (`Locale`, `TranslationMessages`)
- UI component prop type definitions shared across `shared/ui/`
- Form schema types (Zod schemas, validation types) used client-side
- Display-specific type transformations

## What does NOT belong here

- Domain entity types → `@/shared/types` (used by infra and features)
- Infrastructure types → `@/shared/infra/`
- Feature-specific types → `features/{slice}/_types.ts`

## Dependency rule

```ts
import ... from '@/shared/i18n-types/...'  // ✅ allowed by any layer
import ... from '@/shared/types'            // ✅ domain types
```

## Forbidden imports

```ts
import ... from '@/features/...'        // ❌
import ... from '@/shared/infra/...'    // ❌
import ... from '@/shared/ai/...'       // ❌
import ... from '@/app/...'             // ❌
```
