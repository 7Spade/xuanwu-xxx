# Firebase Layer (`src/firebase/`)

## Role

**Sole gateway** to all Firebase services (Firestore, Auth, Storage, Analytics, Messaging). Wraps every Firebase SDK call and exposes a clean, domain-oriented API. Organized with a Facade + Repository pattern.

## Boundary Rules

- 僅封裝 Firebase SDK 與資料存取細節。
- 不得依賴 `view-modules`、`react-hooks`、`react-providers`（UI 層不可知）。
- 不得依賴 `server-commands`、`use-cases`（禁止上層依賴）。
- 不得包含業務規則（邏輯在 `domain-rules`）。
- 不得包含 React 程式碼（`"use client"` 禁止）。
- 僅可被 `server-commands` 或 `react-hooks`（real-time listeners）使用。

## Structure

```
firebase/
  app.client.ts              ← singleton Firebase app initializer
  firebase.config.ts         ← credentials from env vars
  auth/                      ← Firebase Auth adapter
  firestore/
    firestore.client.ts      ← Firestore SDK instance
    firestore.facade.ts      ← unified re-export aggregator
    firestore.read.adapter.ts / write.adapter.ts
    firestore.converter.ts   ← TypeScript-typed data converters
    firestore.utils.ts       ← pure Firestore utilities
    repositories/
      account.repository.ts     ← Organization, Profile, Teams, Bookmarks
      workspace.repository.ts   ← Workspace, Tasks, Issues, Schedule, Grants
      read.repository.ts        ← Audit, Daily, Schedule queries
  storage/                   ← Firebase Storage facade
  analytics/                 ← Firebase Analytics adapter
  messaging/                 ← Firebase Cloud Messaging
```

## Allowed Imports

```ts
import ... from "firebase/*"              // ✅ Firebase SDK
import type ... from "@/domain-types/..."  // ✅ typed return values
```

## Forbidden Imports

```ts
import ... from "react"                    // ❌ no React
import ... from "@/react-hooks/..."        // ❌ no React hooks
import ... from "@/react-providers/..."    // ❌ no React context
import ... from "@/server-commands/..."    // ❌ no upward dependency
import ... from "@/use-cases/..."          // ❌ no upward dependency
import ... from "@/view-modules/..."       // ❌ no UI
import ... from "@/genkit-flows/..."       // ❌ no AI layer
import ... from "@/shared/..."             // ❌ no shared utilities
import ... from "@/app/..."                // ❌ no upward dependency
```

## Side Effects

All repository functions may produce Firestore or Auth reads/writes. Callers must assume every `create*` / `update*` / `delete*` call mutates Firebase state.

## Who Depends on This Layer?

`src/server-commands/` (for all mutations and reads) and `src/react-hooks/` (for `onSnapshot` real-time listeners only).
