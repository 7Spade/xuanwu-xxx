# Project: Utility Layer

## 1. Responsibility

This directory contains pure, generic helper functions that are not specific to our application's domain (e.g., `cn()` for class names, `formatBytes()` for formatting). These functions should be stateless and have no side effects.

## 2. Dependency Rules

### Allowed Imports:
- `src/types`

### Disallowed Imports:
- `import ... from '@/infra/...'`
- `import ... from '@/hooks/...'`
- `import ... from '@/context/...'`
- `import ... from '@/components/...'`
- `import ... from '@/ai/...'`
- `import ... from '@/app/...'`

A utility function MUST NOT depend on infrastructure (like Firebase), application state (context), or UI components.

## 3. Who Depends on This Layer?

Nearly everyone. `infra`, `hooks`, `context`, `components`, and `app` can all use these generic utilities.
