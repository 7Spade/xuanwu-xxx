# Project: UI Primitives & Shared Components

## 1. Responsibility

This directory contains reusable, "dumb" React components. It is divided into two main categories:
- **`ui/`**: Pure UI primitives, primarily from `shadcn/ui`. These should be generic and context-free.
- **Other subdirectories (e.g., `workspaces/`, `organization/`)**: Shared components that are specific to a domain but are reused across multiple pages.

These components are presentation-focused and should not contain complex business logic or direct data-fetching calls.

## 2. Dependency Rules

Components consume logic and state from higher-level layers.

### Allowed Imports:
- `src/types`
- `src/lib`
- `src/hooks`
- `src/context`
- Other components within `src/components`

### Disallowed Imports:
- `import ... from '@/infra/...'` (CRITICAL: All data must be passed via props or consumed from hooks/context).
- `import ... from '@/ai/...'`
- `import ... from '@/app/...'`

A component should be portable. It should not know about specific pages or layouts.

## 3. Who Depends on This Layer?

The `app` layer. Pages and layouts will import and assemble these components to build the final UI.
