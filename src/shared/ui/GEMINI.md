# Shared Module: `ui` (`src/shared/ui/`)

## Role

UI primitives — shadcn/ui components, global providers (Firebase/Auth/i18n/Theme),
i18n types, route constants, and utility hooks.

## Contents

```
shared/ui/
├── shadcn-ui/         ← shadcn/ui component library (Button, Card, Dialog, ...)
├── app-providers/     ← FirebaseProvider, AuthProvider, I18nProvider, ThemeProvider
├── i18n-types/        ← i18n key schema + message helpers
├── constants/         ← ROUTES, skill library (SKILLS array)
├── utility-hooks/     ← use-mobile, use-toast
└── utils/             ← (moved to @/shared/lib)
```

## Rules

- No domain-specific logic
- No imports from `@/features/*`
- Only depends on `@/shared/types` (for typed props)
- `app-providers/` may import `@/shared/infra` for Firebase wiring

## Alias

```ts
import { Button } from "@/shared/ui/shadcn-ui/button";
import { ROUTES } from "@/shared/ui/constants/routes";
import { FirebaseProvider } from "@/shared/ui/app-providers/firebase-provider";
```

## Note

During migration, `src/shared/` continues to work at `@/shared/*`.
The `@/shared/ui/*` alias becomes active once the directory rename completes.
