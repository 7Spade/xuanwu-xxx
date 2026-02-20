# `src/types/` — Core Types Layer (Foundation)

TypeScript domain types and interfaces for the entire application.

## What belongs here

- Domain entities: `Account`, `Workspace`, `ScheduleItem`, `DailyLog`, etc. — all in `domain.ts`
- Shared discriminated unions and enums
- i18n schema types

## What does NOT belong here

- Runtime logic of any kind
- Firebase-specific types (those belong in `src/infra/`)
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
import ... from '@/infra/...'    // ❌
import ... from '@/hooks/...'    // ❌
import ... from '@/context/...'  // ❌
import ... from '@/actions/...'  // ❌
import ... from '@/app/...'      // ❌
import ... from '@/ai/...'       // ❌
```

## Who depends on this layer

**Everyone.** All other layers import types from here.
