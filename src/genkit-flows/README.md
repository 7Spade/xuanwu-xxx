# `src/ai/` — Generative AI Layer

Genkit flows for AI-powered features. Server-side only.

## What belongs here

- `flows/` — Self-contained Genkit flows (prompt + schema + logic in one file)
- `schemas/` — Zod input/output schemas shared across flows
- `providers/` — Provider abstraction (`AIProvider` interface + implementations)
- `genkit.ts` — Genkit instance initialisation

## Naming convention

`{feature}.flow.ts` — e.g. `adapt-ui-color-to-account-context.ts`

## Allowed imports

```ts
import ... from '@/domain-types/...'  // ✅
import ... from '@/lib/...'    // ✅
```

## Forbidden imports

```ts
import ... from '@/react-hooks/...'     // ❌
import ... from '@/react-providers/...'   // ❌
import ... from '@/components/...' // ❌
import ... from '@/app/...'       // ❌
import ... from '@/firebase/...'     // ❌
```

## Who depends on this layer

`app/` via Server Actions or API routes only. UI components must **never** call AI flows directly.
