# Shared Constants

This directory is reserved for shared domain-independent constants.

## Purpose

Use this directory for:
- Route path constants
- HTTP status codes
- Error message constants
- Pagination defaults
- UI state constants
- Animation duration constants
- Validation constants (min/max lengths, patterns)

## Example

```typescript
// src/shared/constants/routes.ts
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const

// src/shared/constants/pagination.ts
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const

// src/shared/constants/validation.ts
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_EMAIL_LENGTH: 255,
  USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
} as const
```

## Note

Domain-specific constants should live in their respective feature slices (e.g., `features/{slice}/_types.ts` or `features/{slice}/index.ts`).
