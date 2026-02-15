# Project: State Management Layer (Context)

## 1. Responsibility

This directory manages React context and application state. It acts as the primary bridge between the UI/hooks layers and the infrastructure layer. It is organized into a clear hierarchy to ensure separation of concerns and efficient data loading.

- **`firebase-context.tsx`**: Provides the raw, initialized Firebase SDK instances (db, auth, etc.).
- **`auth-context.tsx`**: Manages user authentication state (the currently logged-in user).
- **`app-context.tsx`**: Manages top-level application state, such as the list of available organizations and the currently selected `activeAccount`. It does **not** load detailed data for the active account.
- **`account-context.tsx`**: Manages the data associated with the `activeAccount`. It listens for changes to the `activeAccount` and loads the corresponding workspaces, logs, and other account-level data on demand.
- **`workspace-context.tsx`**: (Used within `/dashboard/workspaces/[id]`) Manages the detailed state for a *single* workspace, including its sub-collections like tasks and issues.

## 2. Dependency Rules

- Contexts can depend on contexts "above" them (e.g., `AccountProvider` can use `useApp`), but not below.
- The context layer MUST NOT have knowledge of specific UI components.

### Allowed Imports:
- `src/types`
- `src/lib`
- `src/infra`
- `src/hooks`

### Disallowed Imports:
- `import ... from '@/components/...'`
- `import ... from '@/ai/...'`
- `import ... from '@/app/...'`

## 3. Who Depends on This Layer?

The `hooks`, `components`, and `app` layers. Any component that needs access to global state will consume it via this layer, typically through a helper hook like `useApp()` or `useAccount()`.
