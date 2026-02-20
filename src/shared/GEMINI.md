# Project: Shared Utilities Layer (`src/shared/`)

## 1. Responsibility

This directory holds **cross-cutting code** that is used by multiple unrelated layers and features. It contains no domain-specific logic and no single-feature code.

Sub-directories and their import aliases:

- **`shadcn-ui/`** (`@/shared/shadcn-ui/`) — Primitive UI components from shadcn/ui (Button, Dialog, Card, …). Install new components with `npx shadcn@latest add <component>`.
- **`app-providers/`** (`@/shared/app-providers/`) — Global infrastructure providers: `FirebaseProvider`, `AuthProvider`, `ThemeProvider`, `I18nProvider`. These wrap the entire application.
- **`utility-hooks/`** (`@/shared/utility-hooks/`) — Framework-level React hooks with zero domain knowledge: `use-mobile.tsx`, `use-toast.ts`.
- **`i18n-types/`** (`@/shared/i18n-types/`) — Shared UI-layer type definitions (form schemas, display props, i18n message keys).
- **`utils/`** (`@/shared/utils/`) — Additional shared pure helpers beyond `src/lib/`.
- **`config/`** (`@/shared/config/`) — Application-wide constants: name, version, feature flags.
- **`constants/`** (`@/shared/constants/`) — Domain-independent constants: route names, pagination limits, etc.

## 2. Dependency Rules

`shared/` is consumed by every layer above `src/lib/`. It must remain domain-agnostic.

### Allowed Imports:
- `@/domain-types/` — for typed props or schemas that reference domain shapes
- `@/lib/` — pure utility functions
- `react`, `next`, framework packages

### Disallowed Imports:
- `import ... from '@/firebase/...'`
- `import ... from '@/server-commands/...'`
- `import ... from '@/react-hooks/...'`
- `import ... from '@/react-providers/...'`
- `import ... from '@/use-cases/...'`
- `import ... from '@/view-modules/...'`
- `import ... from '@/app/...'`

## 3. Who Depends on This Layer?

Every layer above `src/lib/`: `src/react-hooks/`, `src/react-providers/`, `src/server-commands/`, `src/view-modules/`, and `src/app/`.

## 4. Key Conventions

- shadcn/ui components are **always** imported from `@/shared/shadcn-ui/`, never from any other path.
- Domain contexts (`AppProvider`, `AccountProvider`, `WorkspaceProvider`) live in `src/react-providers/`, not here.
- Domain hooks live in `src/react-hooks/`, not in `utility-hooks/`.
