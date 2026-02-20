# Project: Infrastructure Layer (`src/firebase/`)

## 1. Responsibility

This directory is the **sole gateway** to all Firebase services (Firestore, Auth, Storage, Analytics, Messaging). It wraps every Firebase SDK call and exposes a clean, domain-oriented API to the rest of the application.

It is organized using a **Facade + Repository** pattern:

- **`app.client.ts`** — Singleton Firebase app initializer. Must be initialized before any service client.
- **`firebase.config.ts`** — Firebase project credentials (populated from environment variables).
- **`auth/`** — Firebase Authentication adapter and client.
- **`firestore/`** — Firestore database access layer.
  - `firestore.client.ts` — Firestore SDK instance.
  - `firestore.facade.ts` — Unified entry point re-exporting all repository functions.
  - `firestore.read.adapter.ts` / `firestore.write.adapter.ts` — Raw Firestore read/write helpers.
  - `firestore.converter.ts` — TypeScript-typed Firestore data converters.
  - `firestore.utils.ts` — Pure Firestore utility functions.
  - `repositories/` — Domain-aggregate–specific data access modules.
    - `account.repository.ts` — User profile + organization CRUD.
    - `workspace.repository.ts` — Workspace lifecycle + sub-collections.
    - `read.repository.ts` — Read-only query functions (audit, daily, schedule logs).
- **`storage/`** — Firebase Storage facade, adapters, and client.
- **`analytics/`** — Firebase Analytics adapter and client.
- **`messaging/`** — Firebase Cloud Messaging (push notifications).

## 2. Dependency Rules

This is a **low-level** layer. It must remain independent of React and the UI.

### Allowed Imports:
- `@/domain-types/` — domain interfaces for typed return values
- `@/lib/` — pure utility functions
- `firebase/*` — Firebase SDK packages

### Disallowed Imports:
- `import ... from 'react'`
- `import ... from '@/react-hooks/...'`
- `import ... from '@/react-providers/...'`
- `import ... from '@/server-commands/...'`
- `import ... from '@/use-cases/...'`
- `import ... from '@/view-modules/...'`
- `import ... from '@/app/...'`

## 3. Who Depends on This Layer?

`src/server-commands/` calls this layer exclusively. Hooks and context providers may call it directly only for **real-time listeners** (onSnapshot). No other layer should call Firebase SDK methods directly.

## 4. Firestore Repository Pattern

Each repository module owns one domain aggregate's data access:

```
firestore.facade.ts     ← thin re-export aggregator
      ↓
repositories/
  account.repository.ts    ← Organization, User Profile, Teams, Bookmarks
  workspace.repository.ts  ← Workspace, Tasks, Issues, Schedule, Grants
  read.repository.ts       ← Audit logs, Daily logs, Schedule queries
```

**Rule:** Never call Firestore directly in actions, hooks, or components. Always go through the facade or a named repository export.
