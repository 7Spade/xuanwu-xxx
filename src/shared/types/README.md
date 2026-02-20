# Shared Types

This directory is reserved for UI-layer shared type definitions.

## Note on Domain Types

Domain types remain in `src/types/` because they are used by:
- Infrastructure layer (`src/infrastructure/`)
- Server Actions (`src/actions/`)
- Business logic layers

Moving them would require updating hundreds of imports across critical layers.

## Purpose

Use this directory for:
- UI component prop type definitions
- Form schema types (Zod schemas, validation types)
- Display-specific type transformations
- Client-side state type definitions
- UI event handler types
- Component composition types

## Example

```typescript
// src/shared/types/forms.ts
import { z } from "zod"

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>

// src/shared/types/display.ts
export interface DisplayUser {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
}

// Transform from domain User to DisplayUser
export function toDisplayUser(user: User): DisplayUser {
  return {
    id: user.id,
    name: user.profile.displayName || user.email,
    avatar: user.profile.avatarUrl,
    isOnline: user.status === "online",
  }
}
```

## Guideline

- **Domain types**: Keep in `@/types` (infrastructure, actions, business logic)
- **UI types**: Add to `@/shared/types` (component props, forms, display transformations)
