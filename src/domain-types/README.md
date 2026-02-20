# `src/domain-types/` — Core Types Layer (Foundation)

TypeScript domain types and interfaces for the entire application.

## Current files

| File | Description |
|------|-------------|
| `domain.ts` | All domain entities: `Account`, `Workspace`, `ScheduleItem`, `DailyLog`, etc. |

> **i18n types** (`i18n.ts`, `i18n.schema.ts`) have been moved to `src/shared/types/`.

## What belongs here

- Domain entities and value objects used by infra, actions, hooks, and app
- Shared discriminated unions and enums that belong to the domain model

## What does NOT belong here

- Runtime logic of any kind
- Firebase-specific types (those belong in `src/firebase/`)
- UI-specific prop types (those belong with their component)

## Naming convention

- Primary domain types → `domain.ts`
- Separate files only for large, independent type groups (e.g. `i18n-schema.ts`)

## Dependency rule: ZERO

This is the foundation layer. It must **not** import from any other `src/` directory.

## Allowed imports

```ts
// Only external packages (e.g. firebase/firestore for FieldValue types)
```

## Forbidden imports

```ts
import ... from '@/lib/...'      // ❌
import ... from '@/firebase/...'    // ❌
import ... from '@/react-hooks/...'    // ❌
import ... from '@/react-providers/...'  // ❌
import ... from '@/server-commands/...'  // ❌
import ... from '@/app/...'      // ❌
import ... from '@/genkit-flows/...'       // ❌
```

## Who depends on this layer

**Everyone.** All other layers import types from here.
