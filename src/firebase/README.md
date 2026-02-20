# `src/firebase/` — Infrastructure Layer (Firebase)

The **sole gateway** to all Firebase services. No other layer in the app calls the Firebase SDK directly.

## Sub-directories

| Directory / File | Contents |
|------------------|---------|
| `app.client.ts` | Firebase app singleton initializer |
| `firebase.config.ts` | Firebase project credentials |
| `auth/` | Firebase Authentication — `auth.client.ts`, `auth.adapter.ts` |
| `firestore/` | Firestore database — facade, repositories, adapters, converter, utils |
| `firestore/repositories/` | Domain-aggregate repositories: `account`, `workspace`, `read` |
| `storage/` | Firebase Storage — facade, adapters, client |
| `analytics/` | Firebase Analytics — adapter, client |
| `messaging/` | Firebase Cloud Messaging — push notifications |

## Architecture: Facade + Repository

```
server-commands/  (or real-time hooks)
       ↓
firestore.facade.ts     ← thin re-exporter
       ↓
repositories/
  account.repository.ts
  workspace.repository.ts
  read.repository.ts
```

- The **facade** is the single import surface for the rest of the app.
- **Repositories** are organized by domain aggregate and contain the actual Firestore logic.
- **Adapters** encapsulate raw SDK read/write primitives used by repositories.

## What belongs here

- Firebase SDK initialization and configuration
- Firestore document reads, writes, and real-time listeners
- Firebase Auth sign-in / sign-out / token operations
- Firebase Storage upload / download operations
- Firebase Analytics event tracking
- Data converters and typed collection references

## What does NOT belong here

- Business rules / permission checks → `src/domain-rules/`
- Multi-step orchestration → `src/server-commands/` or `src/use-cases/`
- React hooks or context → `src/react-hooks/` / `src/react-providers/`
- UI components → `src/view-modules/` or `src/app/`

## Allowed imports

```ts
import ... from '@/domain-types/...'  // ✅ typed return values
import ... from '@/lib/...'           // ✅ pure utilities
import { ... } from 'firebase/...'    // ✅ Firebase SDK
```

## Forbidden imports

```ts
import ... from 'react'                 // ❌ no React
import ... from '@/react-hooks/...'     // ❌
import ... from '@/react-providers/...' // ❌
import ... from '@/server-commands/...' // ❌ no upward deps
import ... from '@/use-cases/...'       // ❌
import ... from '@/view-modules/...'    // ❌
import ... from '@/app/...'             // ❌
```

## Who depends on this layer

`src/server-commands/` (mutations and one-shot reads).  
`src/react-hooks/` (real-time `onSnapshot` listeners only).
