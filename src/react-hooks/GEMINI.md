# React Hooks Layer (`src/react-hooks/`)

## 1. Responsibility

Custom React hooks that bridge the UI layer and lower-level infrastructure. Provides clean, reusable access to application state and Firebase-backed operations.

## 2. Sub-directories and their hooks

| Directory | File pattern | What it provides |
|-----------|-------------|-----------------|
| `state-hooks/` | `use-*.ts` | Read domain state from `react-providers` (e.g., `use-app.ts`, `use-account.ts`, `use-visible-workspaces.ts`) |
| `command-hooks/` | `use-*-commands.ts` | Wrap `server-commands` with React concerns: auth guards, toasts, `useCallback` (e.g., `use-schedule-commands.ts`) |
| `service-hooks/` | `use-*.ts` | Wrap infra services: `use-logger.ts`, `use-storage.ts`, `use-daily-upload.ts` |

## 3. Input / Output contracts

| Hook pattern | Input (params) | Output | Side effects |
|-------------|---------------|--------|-------------|
| `useApp()` | — | `{ activeAccount, setActiveAccount, ... }` | None — reads context |
| `useAccount()` | — | `{ workspaces, members, ... }` | None — reads context |
| `use*Commands()` | — | `{ commandFn: (...args) => Promise<void>, isPending }` | Firestore write via `server-commands` |
| `use*Upload()` | — | `{ upload: (file) => Promise<void>, isUploading }` | Firebase Storage write |
| `useWorkspaceAudit(workspaceId)` | `string` | `{ logs: AuditLog[], isLoading }` | Firestore real-time listener |

## 4. Side effects

- `state-hooks/` — **No side effects**. Read-only context accessors.
- `command-hooks/` — **Firestore or Auth writes** via `server-commands`. Each call may produce a write side effect.
- `service-hooks/` — **Firebase Storage writes** (`use-storage`, `use-daily-upload`) or logging side effects (`use-logger`).

## 5. Dependency rules

### Allowed
- `@/domain-types/` — domain interfaces
- `@/lib/` — pure utilities
- `@/firebase/` — Firestore listeners and real-time data only
- `@/server-commands/` — for command-hooks wrapping async write operations
- `@/react-providers/` — reading context values via `useContext`
- `@/domain-rules/` — pure validation

### Forbidden
- `@/app/` — no upward dependency on pages/layouts
- `@/genkit-flows/` — AI flows belong in server-commands
- `@/view-modules/` — no UI component imports
- `@/use-cases/` — use-cases are orchestrated at the app layer, not in hooks

## 6. Who depends on this layer?

`src/react-providers/` (for complex provider logic), `src/view-modules/` (view components), and `src/app/` (pages/layouts).

## 7. Naming conventions

- File: `use-{what-it-does}.ts` (kebab-case)
- Export: `use{WhatItDoes}()` (camelCase with `use` prefix)
- Never export a hook from a file that does not start with `use-`.
