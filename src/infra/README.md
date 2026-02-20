# `src/infra/` — Infrastructure Layer

All interactions with external services (Firebase). **No React. No hooks.**

## Sub-directories

```
infra/firebase/
  auth/           ← Firebase Auth adapter
  firestore/
    repositories/ ← One file per aggregate (account, workspace, ...)
    firestore.facade.ts  ← Thin re-export surface used by actions/
    firestore.write.adapter.ts  ← Low-level addDoc/updateDoc/deleteDoc wrappers
    firestore.utils.ts   ← snapshotToRecord and other helpers
  storage/
    storage.facade.ts    ← File upload helpers
```

## What belongs here

- Direct Firebase SDK calls (Firestore, Auth, Storage)
- Repository functions: one file per domain aggregate
- The facade re-exports repositories as the public API surface

## What does NOT belong here

- Business orchestration → `src/actions/`
- React state or hooks → `src/hooks/`
- UI components → never

## Naming convention

- Repositories: `{aggregate}.repository.ts`
- Adapters: `{service}.adapter.ts`
- Facades: `{service}.facade.ts`

## Allowed imports

```ts
import ... from '@/types/...'  // ✅
import ... from '@/lib/...'    // ✅
```

## Forbidden imports

```ts
import ... from '@/hooks/...'      // ❌
import ... from '@/context/...'    // ❌
import ... from '@/server-commands/...'    // ❌
import ... from '@/components/...' // ❌
import ... from '@/app/...'        // ❌
import ... from '@/genkit-flows/...'         // ❌
```

## Who depends on this layer

`src/actions/` (primary consumer). Context providers use it directly for real-time listeners only.
