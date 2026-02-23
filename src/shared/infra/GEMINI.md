# Shared Module: `infra` (`src/shared/infra/`)

## Role

Firebase infrastructure — SDK clients, adapters, facades, and domain repositories.
The only layer that directly calls Firebase SDK.

## Contents

```
shared/infra/
├── app.client.ts              ← Firebase app initialization
├── firebase.config.ts         ← Firebase config
├── auth/
│   ├── auth.adapter.ts        ← signIn, signOut, onAuthStateChanged wrappers
│   └── auth.client.ts         ← Firebase Auth instance
├── analytics/
│   ├── analytics.adapter.ts
│   └── analytics.client.ts
├── firestore/
│   ├── firestore.client.ts    ← Firestore instance
│   ├── firestore.converter.ts ← Generic converter
│   ├── firestore.facade.ts    ← High-level read/write operations
│   ├── firestore.utils.ts
│   └── repositories/
│       ├── account.repository.ts
│       ├── user.repository.ts
│       ├── workspace.repository.ts
│       ├── schedule.repository.ts
│       ├── daily.repository.ts
│       └── audit.repository.ts
├── messaging/
│   └── messaging.adapter.ts
└── storage/
    ├── storage.client.ts
    ├── storage.facade.ts
    ├── storage.read.adapter.ts
    └── storage.write.adapter.ts
```

## Rules

- Only depends on `@/shared/types` and `@/shared/lib`
- No React, no UI components
- The ONLY layer that calls Firebase SDK directly

## Alias

```ts
import { scheduleRepository } from "@/shared/infra/firestore/repositories/schedule.repository";
import { authAdapter } from "@/shared/infra/auth/auth.adapter";
```
