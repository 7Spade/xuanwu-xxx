# Shared Utils

This directory is reserved for additional shared utility functions.

## Note on @/lib/utils

The primary utility file `@/lib/utils` remains at `src/lib/utils.ts` because `components.json` hardcodes this path:

```json
{
  "aliases": {
    "utils": "@/lib/utils"
  }
}
```

This configuration is used by shadcn/ui CLI when adding new components.

## Purpose

Use this directory for:
- UI-layer helper functions that don't fit in `@/lib/utils`
- Formatting utilities (dates, numbers, currency)
- String manipulation helpers
- Client-side storage wrappers
- Other shared utilities that are framework-independent

## Example

```typescript
// src/shared/utils/format-date.ts
export function formatRelativeTime(date: Date): string {
  // ...
}
```
