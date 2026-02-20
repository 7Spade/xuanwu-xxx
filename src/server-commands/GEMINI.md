# Server Commands Layer (`src/server-commands/`)

## Role

Server boundary — wraps Firebase calls into typed async functions (Next.js Server Actions). No business rules. No React. No UI.

## Boundary Rules

- 僅處理伺服器端 action（Next.js server action）。
- 可依賴 `firebase`、`genkit-flows`、`domain-rules`、`domain-types`、`shared/utils|constants|i18n-types`。
- 不得包含業務規則核心邏輯（邏輯在 `domain-rules`）。
- 不得依賴 `view-modules`（UI 不可知）。
- 不得依賴 `use-cases`（禁止上層依賴 / 循環依賴）。
- 不得包含任何 React 引用（`"use client"` 禁止）。

## File Naming Convention

Each module: explicit logic file + thin `index.ts` re-export barrel.

| Module | Logic file | What it provides |
|--------|-----------|-----------------|
| `account/` | `account.commands.ts` | Organization CRUD, teams, members |
| `auth/` | `auth.commands.ts` | `signIn`, `registerUser`, `signOut`, `sendPasswordResetEmail` |
| `workspace/` | `workspace.commands.ts` | Workspace lifecycle, grants, capabilities |
| `bookmark/` | `bookmark.commands.ts` | Bookmark toggle |
| `daily/` | `daily.commands.ts` | Daily log likes and comments |
| `document-parser/` | `document-parser.commands.ts` | AI document parsing (via genkit-flows) |
| `files/` | `files.commands.ts` | File manifest retrieval |
| `issue/` | `issue.commands.ts` | Issue CRUD and comments |
| `members/` | `members.commands.ts` | Workspace member retrieval |
| `schedule/` | `schedule.commands.ts` | Schedule item CRUD, member assignment |
| `storage/` | `storage.commands.ts` | File uploads (photo, attachment, avatar) |
| `task/` | `task.commands.ts` | Task CRUD, batch import |
| `user/` | `user.commands.ts` | User account creation and profile management |

## Input / Output Contracts

`(param1, param2, ...) => Promise<string | void | DomainType>`

- Return values must be JSON-serializable: `string`, `number`, `void`, plain object, or array.
- Never return Firebase `DocumentReference`, `Timestamp`, or other non-serializable objects.
- Never accept React state (`useState`, `useRef`) as parameters.

## Side Effects

- `create*` / `update*` / `delete*` → Firestore write
- `register*` / `signIn*` / `signOut*` → Firebase Auth mutation
- `upload*` → Firebase Storage write
- `get*` / `fetch*` → Firestore read only

## Allowed Imports

```ts
import ... from "@/firebase/..."                     // ✅ facade or repositories
import ... from "@/genkit-flows/..."                 // ✅ AI server actions
import ... from "@/domain-rules/..."                 // ✅ pure validation
import ... from "@/domain-types/..."                 // ✅ domain types
import ... from "@/shared/utils/..."                 // ✅ pure utilities
import ... from "@/shared/constants/..."             // ✅ constants
import ... from "@/shared/i18n-types/..."            // ✅ i18n types
```

## Forbidden Imports

```ts
import ... from "react"                              // ❌ no React
import ... from "@/react-hooks/..."                  // ❌ no hooks
import ... from "@/react-providers/..."              // ❌ no context
import ... from "@/shared/shadcn-ui/..."             // ❌ no UI components
import ... from "@/shared/app-providers/..."         // ❌ no React providers
import ... from "@/shared/utility-hooks/..."         // ❌ no React hooks
import ... from "@/use-cases/..."                    // ❌ no upward dependency
import ... from "@/view-modules/..."                 // ❌ no UI
import ... from "@/app/..."                          // ❌ no upward dependency
```

## Who Depends on This Layer?

`src/use-cases/` (orchestration) and `src/react-hooks/command-hooks/` (wrapping server actions with React concerns).
