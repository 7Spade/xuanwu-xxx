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

- Domain entity types → `src/types/domain.ts` (used by infra/actions too)
- Infrastructure types → `src/infra/`
- Action param types → co-locate with actions in `src/actions/{domain}/`

## Dependency rule

```ts
import ... from '@/shared/types/...'  // ✅ allowed by any layer
import ... from '@/types/...'         // ✅ also still valid for domain types
```

## Forbidden imports

```ts
import ... from '@/infra/...'    // ❌
import ... from '@/hooks/...'    // ❌
import ... from '@/context/...'  // ❌
import ... from '@/server-commands/...'  // ❌
import ... from '@/app/...'      // ❌
```
