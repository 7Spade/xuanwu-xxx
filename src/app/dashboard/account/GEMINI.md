# Project: Account Governance Pages

## 1. Responsibility

This directory contains all pages and components related to the "Account Governance" section of the dashboard. This includes functionality for managing an organization's members, internal teams, external partner teams, viewing permission matrices, and auditing activity.

These are page-level components that compose the administrative interface for the active organizational account.

## 2. Dependency Rules

These are feature pages within the dashboard and can consume shared dashboard logic and components.

### Allowed Imports:
- `src/types`
- `src/lib`
- `src/hooks`
- `src/context`
- `src/components` (Global UI Primitives)
- `src/app/dashboard/_components` (Shared Dashboard Components)

### Disallowed Imports:
- `import ... from '@/app/login/...'`
- `import ... from '@/app/dashboard/workspaces/...'` (Avoid coupling between distinct dashboard sections)

## 3. Who Depends on This Layer?

The `dashboard` layout renders these pages. Components within this directory are specific to the account governance feature and should not be imported by other parts of the application.
