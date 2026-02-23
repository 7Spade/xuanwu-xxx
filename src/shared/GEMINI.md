# Shared Utilities Layer (`src/shared/`)

## Role

Cross-cutting code used by all feature slices and `app/`. Contains no domain-specific (feature) logic. Must remain domain-agnostic.

## Boundary Rules

- 僅包含純工具函式、UI primitives、基礎設施 adapters 與型別定義。
- 不得依賴任何 `features/` 切片。
- 不得依賴 `app/`。
- `shared/infra/` 是唯一可直接呼叫 Firebase SDK 的層。

## Sub-directories

| Path | Alias | Contents |
|------|-------|----------|
| `types/` | `@/shared/types` | TypeScript domain types — zero deps |
| `lib/` | `@/shared/lib` | Pure utilities and domain rules (no I/O, no React) |
| `infra/` | `@/shared/infra` | Firebase SDK adapters, repositories, facades |
| `ai/` | `@/shared/ai` | Genkit AI flows and schemas (server-only) |
| `ui/` | `@/shared/ui` | shadcn/ui, app-providers, i18n, constants, utility hooks |

## Allowed Imports

```ts
import type { WorkspaceTask } from "@/shared/types"   // ✅ domain types
import { cn } from "@/shared/lib"                      // ✅ pure utilities
import { scheduleRepository } from "@/shared/infra/firestore/repositories/schedule.repository"
import { Button } from "@/shared/ui/shadcn-ui/button"  // ✅ UI primitives
```

## Forbidden Imports (all sub-dirs)

```ts
import ... from "@/features/..."  // ❌ never depend on feature slices
import ... from "@/app/..."       // ❌ no upward dependency
```

> **Exception:** `shared/ui/app-providers/` may import `@/shared/infra` for Firebase wiring.

## Key Conventions

- Shadcn/UI components are **always** imported from `@/shared/ui/shadcn-ui/`, never from any other path.
- Domain contexts and providers live in `@/shared/ui/app-providers/`.
- Feature-specific hooks live in `features/{slice}/_hooks/`, not in `shared/`.
- Consult `FLOWS.md` before adding a new data flow pattern.

## Who Depends on This Layer?

All feature slices (`features/*/`) and `app/`.
