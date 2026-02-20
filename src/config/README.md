# `src/config/` — App-Wide Configuration

Static constants and environment variable helpers. **No side effects.**

## What belongs here

- Environment variable accessors (e.g. `env.ts` wrapping `process.env.*`)
- App-wide constants (e.g. pagination limits, feature flags, route paths)
- Firebase project configuration

## What does NOT belong here

- Business logic → `src/actions/`
- Firebase SDK initialisation → `src/infra/firebase/`
- React context / providers → `src/context/`

## Naming convention

`{concern}.config.ts` — e.g. `firebase.config.ts`, `env.ts`

## Allowed imports

```ts
import ... from '@/types/...'  // ✅
```

## Forbidden imports

```ts
import ... from '@/lib/...'     // ❌ (config should be simpler than lib)
import ... from '@/infra/...'   // ❌
import ... from '@/hooks/...'   // ❌
import ... from '@/context/...' // ❌
import ... from '@/app/...'     // ❌
```

## Who depends on this layer

`infra/`, `actions/`, `hooks/`, `context/`, `app/`.
