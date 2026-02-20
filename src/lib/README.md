# `src/lib/` — Utility Layer

Pure, stateless helper functions with no side effects.

## What belongs here

- Generic formatting helpers (`formatBytes`, `formatDate`, etc.)
- `cn()` — Tailwind class merging utility
- Type guards and narrowing helpers
- Other framework-agnostic utilities used across layers

## What does NOT belong here

- Firebase SDK calls → `src/infra/`
- Business logic → `src/actions/`
- React-specific helpers → `src/hooks/ui/`
- App constants → `src/config/`

## Naming convention

`{utility-name}.ts` — e.g. `utils.ts`, `format.ts`, `date.ts`

## Allowed imports

```ts
import ... from '@/types/...'  // ✅ (for type-only imports)
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

## Who depends on this layer

Everyone — `infra`, `actions`, `hooks`, `context`, `app`.
