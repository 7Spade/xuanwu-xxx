# Project: Shared Dashboard Components

## 1. Responsibility

This directory contains reusable React components that are shared **exclusively within the dashboard context**. This includes common UI elements like the main sidebar (`dashboard-sidebar.tsx`) and the page header (`page-header.tsx`).

These components are not generic enough to live in the global `src/components` directory, but they are reused across multiple pages within the `/dashboard` route.

## 2. Dependency Rules

These components should be "dumb" and receive data and logic via props or hooks.

### Allowed Imports:
- `src/types`
- `src/lib`
- `src/hooks`
- `src/context`
- `src/components` (For consuming base UI primitives)

### Disallowed Imports:
- **`import ... from '@/firebase/...'` (CRITICAL)**: Components must not fetch data directly. Data should be passed down from pages or consumed via hooks (`useApp`, `useAuth`).
- **`import ... from '@/app/dashboard/...'`**: Shared components must not have knowledge of the specific pages they are rendered in.

## 3. Naming Conventions

- Component file names should be descriptive and use `kebab-case.tsx`.
- Example: `dashboard-sidebar.tsx`, `page-header.tsx`.

## 4. Who Depends on This Layer?

The primary consumers are the dashboard layout (`/dashboard/layout.tsx`) and all its child pages (e.g., `/dashboard/page.tsx`, `/dashboard/workspaces/page.tsx`, `/dashboard/account/...`).
