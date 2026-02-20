# `src/entities/` — Entity Value Objects (Reserved)

> **Status: Reserved for future use.**  
> Domain data currently lives in `src/types/domain.ts` as plain TypeScript interfaces.  
> This directory is reserved for **entity classes with behaviour** if the codebase grows to need them.

## What belongs here (if used)

Rich domain objects that encapsulate both **data and rules** for a single aggregate root:

```
src/entities/
  workspace.entity.ts   ← Workspace value-object with guard methods
  account.entity.ts     ← Account entity: isOrganization(), canInvite(), etc.
  schedule.entity.ts    ← ScheduleItem with status-transition validation
```

Each file exports one entity class or factory function.  
No UI, no Firebase, no React — pure domain logic.

## What does NOT belong here

- Plain TypeScript interfaces / type aliases → `src/types/domain.ts`
- Firebase read/write operations → `src/infra/`
- Business-level orchestration (multiple entities) → `src/actions/`
- React hooks → `src/hooks/`

## Naming convention

`{entity-name}.entity.ts` — e.g. `workspace.entity.ts`, `account.entity.ts`

## Allowed imports

```ts
import ... from '@/types/...'  // ✅ domain interfaces as input/output shapes
import ... from '@/lib/...'    // ✅ pure utilities
```

## Forbidden imports

```ts
import ... from '@/infra/...'    // ❌ no Firebase
import ... from '@/actions/...'  // ❌ no orchestration
import ... from '@/hooks/...'    // ❌ no React
import ... from '@/context/...'  // ❌ no React
import ... from 'react'          // ❌ no React
```

## Current guidance

Do **not** create files here without first confirming that:

1. The logic cannot fit in a plain utility in `src/lib/`
2. The logic is purely about a single domain aggregate (no I/O)
3. More than one layer would benefit from sharing the behaviour

If those conditions are not all met, add the logic to `src/actions/` or `src/lib/` instead.

## Who depends on this layer

`src/actions/`, `src/hooks/`, `src/lib/` — anything that needs the domain behaviour.
