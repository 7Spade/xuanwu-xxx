# Project: Reusable Logic Layer (Hooks)

## 1. Responsibility

This directory contains custom React Hooks that encapsulate reusable UI logic or provide clean, reusable access to application state and infrastructure. For example, `useApp()` provides access to the `AppContext`, and `useLogger()` provides a clean interface for logging.

## 2. Dependency Rules

Hooks act as a bridge between the UI and the lower-level layers.

### Allowed Imports:
- `src/types`
- `src/lib`
- `src/infra`
- `src/context`

### Disallowed Imports:
- `import ... from '@/components/...'`
- `import ... from '@/ai/...'`
- `import ... from '@/app/...'`

A hook MUST NOT import a specific UI component. Its job is to provide logic *to* a component, not to depend on one.

## 3. Who Depends on This Layer?

The `context`, `components`, and `app` layers.
