# Shared Config

This directory is reserved for shared configuration constants.

## Purpose

Use this directory for:
- Application-wide configuration values
- Feature flags and toggles
- Environment-specific settings
- API endpoints and base URLs
- Default pagination limits
- Timeout values
- Theme configuration constants

## Example

```typescript
// src/shared/config/app.ts
export const APP_CONFIG = {
  name: "Xuanwu",
  version: "1.0.0",
  defaultLocale: "en",
  supportedLocales: ["en", "zh"],
} as const

// src/shared/config/features.ts
export const FEATURE_FLAGS = {
  enableDarkMode: true,
  enableI18n: true,
  enableAnalytics: false,
} as const
```

## Note

Environment variables should still be accessed via `process.env` in server components or configured in `next.config.ts`.
