# Project: Account Governance Pages

## 1. Responsibility

This directory contains all pages and components related to the "Account Governance" section of the dashboard. This includes functionality for managing an organization's members, internal teams, external partner teams, viewing permission matrices, and auditing activity.

These are page-level components that compose the administrative interface for the active organizational account.

## 2. Dependency Rules

These are page-level route files that compose feature views. Import only from feature slice public APIs and shared modules.

### Allowed Imports:
- `@/features/{slice}` (public API `index.ts` only)
- `@/shared/types`
- `@/shared/lib`
- `@/shared/ui/...`

### Disallowed Imports:
- `import ... from '@/features/{slice}/_...'` (private slice paths)
- `import ... from '@/shared/infra/...'` (infra is for slice `_actions.ts` only)
- `import ... from '@/app/login/...'`

## 3. Who Depends on This Layer?

The `dashboard` layout renders these pages. Components within this directory are specific to the account governance feature and should not be imported by other parts of the application.
