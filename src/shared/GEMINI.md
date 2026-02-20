# Shared Utilities Layer (`src/shared/`)

## Role

Cross-cutting code used by multiple unrelated layers. Contains no domain-specific logic and no single-feature code. Pure utility layer — must remain domain-agnostic.

## Boundary Rules

- 僅包含純工具函式（format、guard、mapper、constants）與 UI primitives。
- 不得依賴任何業務層（`domain-rules`、`server-commands`、`use-cases`、`react-hooks`、`react-providers`）。
- 不得引用 `firebase`、`genkit-flows`（例外：`app-providers/` 可引用 `firebase` 用於基礎設施接線）。
- 不得依賴 `view-modules`、`app`。

## Sub-directories

| Path | Alias | Contents |
|------|-------|----------|
| `shadcn-ui/` | `@/shared/shadcn-ui/` | Shadcn/UI primitives (Button, Dialog, Card, …) |
| `app-providers/` | `@/shared/app-providers/` | Global infra providers: `FirebaseProvider`, `AuthProvider`, `ThemeProvider`, `I18nProvider` |
| `utility-hooks/` | `@/shared/utility-hooks/` | Framework-level React hooks: `use-mobile.tsx`, `use-toast.ts` |
| `i18n-types/` | `@/shared/i18n-types/` | UI-layer type definitions (form schemas, i18n message keys) |
| `utils/` | `@/shared/utils/` | Additional pure helpers |
| `config/` | `@/shared/config/` | App-wide constants: name, version, feature flags |
| `constants/` | `@/shared/constants/` | Domain-independent constants: route names, pagination |
| `FLOWS.md` | — | Canonical data flow diagrams (4 patterns: A–D) |

## Allowed Imports

```ts
import type ... from "@/domain-types/..."  // ✅ typed props/schemas referencing domain shapes
import ... from "react"                    // ✅ framework
import ... from "next/*"                   // ✅ framework
```

## Forbidden Imports (for all sub-dirs except `app-providers/`)

```ts
import ... from "@/firebase/..."           // ❌ no infrastructure
import ... from "@/domain-rules/..."       // ❌ no business logic
import ... from "@/server-commands/..."    // ❌ no server actions
import ... from "@/react-hooks/..."        // ❌ no domain hooks
import ... from "@/react-providers/..."    // ❌ no domain providers
import ... from "@/genkit-flows/..."       // ❌ no AI
import ... from "@/use-cases/..."          // ❌ no orchestration
import ... from "@/view-modules/..."       // ❌ no UI modules
import ... from "@/app/..."                // ❌ no upward dependency
```

> **Exception:** `app-providers/` may import `@/firebase` for infrastructure wiring (ESLint `ignores` rule).

## Key Conventions

- Shadcn/UI components are **always** imported from `@/shared/shadcn-ui/`, never from any other path.
- Domain contexts live in `src/react-providers/`, not here.
- Domain hooks live in `src/react-hooks/`, not in `utility-hooks/`.
- Consult `FLOWS.md` before adding a new data flow pattern.

## Who Depends on This Layer?

Every layer: `domain-types`, `server-commands`, `react-hooks`, `react-providers`, `use-cases`, `view-modules`, `app`.
