# `src/shared/` — Globally Shared Code

Everything in this directory is used across multiple unrelated features and `app/`.  
**No feature-specific logic. No single-slice code.**

## Sub-directories

| Directory | Contents | Import alias |
|-----------|---------|-------------|
| `types/` | TypeScript domain types — zero deps | `@/shared/types` |
| `lib/` | Pure utilities and domain rules (no I/O, no React) | `@/shared/lib` |
| `infra/` | Firebase SDK adapters, repositories, facades | `@/shared/infra` |
| `ai/` | Genkit AI flows and schemas (server-only) | `@/shared/ai` |
| `ui/` | shadcn/ui, app-providers, i18n, constants, utility hooks | `@/shared/ui` |

## `ui/` — UI primitives and providers

All shadcn primitive components, global providers, and i18n types live here. Install with:

```bash
npx shadcn@latest add <component>   # components.json points to @/shared/ui/shadcn-ui
```

✅ Import: `import { Button } from "@/shared/ui/shadcn-ui/button"`  
❌ Never import ui primitives from paths outside `@/shared/ui/shadcn-ui/`.

## `infra/` — Firebase SDK (only layer that touches Firebase directly)

```ts
import { scheduleRepository } from "@/shared/infra/firestore/repositories/schedule.repository"
import { authAdapter } from "@/shared/infra/auth/auth.adapter"
```

Feature slices call infra from their `_actions.ts` or `_queries.ts`. Never call infra directly from `app/` or `_components/`.

## What does NOT belong here

- Feature-specific hooks → `features/{slice}/_hooks/`
- Feature-specific actions → `features/{slice}/_actions.ts`
- Feature-specific context → `features/{slice}/_hooks/` or via provider in `shared/ui/app-providers/`

## Who depends on this layer

All feature slices (`features/*/`) and `app/`.
