# Project: Core Types Layer

## 1. Responsibility

This directory defines all core data structures and TypeScript types for the entire application (e.g., `Organization`, `Workspace`, `User`). It is the ubiquitous language of the system, expressed in code.

## 2. Dependency Rule: ZERO Dependencies

This layer is the foundation. It MUST NOT import from any other directory within the `src` folder (`lib`, `infra`, `hooks`, `context`, `components`, `app`, `ai`).

### Allowed Imports:
- None from `src/*`

### Disallowed Imports:
- `import ... from '@/lib/...'`
- `import ... from '@/firebase/...'`
- `import ... from '@/react-hooks/...'`
- `import ... from '@/react-providers/...'`
- `import ... from '@/components/...'`
- `import ... from '@/genkit-flows/...'`
- `import ... from '@/app/...'`

## 3. Who Depends on This Layer?

**Everyone.** Any other layer can and should import types from this directory.
