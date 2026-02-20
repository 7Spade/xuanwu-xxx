# Server Commands Layer (`src/server-commands/`)

## Responsibility

Server boundary — orchestrates Firebase calls.  
No business rules. No React. No UI.  
Pure `async` functions with explicit parameters.

## File naming convention

Each module uses an **explicit named file** for the commands, with `index.ts` as a thin re-export barrel:

| Module | Logic file | What it provides |
|--------|-----------|-----------------|
| `account/` | `account.commands.ts` | Organization CRUD, teams, members |
| `auth/` | `auth.commands.ts` | `signIn`, `registerUser`, `signOut`, `sendPasswordResetEmail` |
| `workspace/` | `workspace.commands.ts` | Workspace lifecycle, grants, capabilities |
| `bookmark/` | `bookmark.commands.ts` | Bookmark add/remove toggle |
| `daily/` | `daily.commands.ts` | Daily log likes and comments |
| `document-parser/` | `document-parser.commands.ts` | AI document parsing Server Action |
| `files/` | `files.commands.ts` | File manifest retrieval |
| `issue/` | `issue.commands.ts` | Issue CRUD and comments |
| `members/` | `members.commands.ts` | Workspace member retrieval |
| `schedule/` | `schedule.commands.ts` | Schedule item CRUD, member assignment |
| `storage/` | `storage.commands.ts` | File uploads (photo, attachment, avatar) |
| `task/` | `task.commands.ts` | Task CRUD, batch import |
| `user/` | `user.commands.ts` | User account creation and profile management |
| `index.ts` | re-exports all modules | — |

## Input / Output contracts

Every command function signature follows: `(explicitParam1, explicitParam2, ...) => Promise<string | void | DomainType>`

- Return value **must** be JSON-serializable: `string`, `number`, `void`, plain object, or array.
- **Never** return Firebase `DocumentReference`, `Timestamp`, or other non-serializable objects.
- **Never** accept React state (`useState`, `useRef`) as parameters.

## Side effects

**All commands may mutate Firebase Firestore or Firebase Auth.** Callers must assume every call produces a write side effect unless the function is prefixed with `get`, `fetch`, or `read`.

- `create*` / `update*` / `delete*` — Firestore write
- `register*` / `signIn*` / `signOut*` — Firebase Auth mutation
- `upload*` — Firebase Storage write
- `get*` / `fetch*` — Firestore read only (no mutation)

## Dependency rules

### Allowed
- `@/firebase/` — call facade or repositories (never Firestore SDK directly)
- `@/domain-rules/` — pure validation before calling infra
- `@/domain-types/` — domain types
- `@/lib/` — pure utilities
- `@/genkit-flows/` — AI server actions only

### Forbidden
- `react` — no React hooks or context
- `@/react-hooks/` — no hook calls
- `@/react-providers/` — no context reads
- `@/shared/shadcn-ui/` — no UI components
- `@/view-modules/` — no view components
- `@/app/` — no app layer
- `@/use-cases/` — no upward dependency

## Coding constraints

1. **Call `@/firebase/` facade or repositories** — never touch Firestore SDK directly.
2. **No business rules** — permission checks and state validation belong in `@/domain-rules/`.
3. **No permission logic** — all `isOwner` / `hasAccess` checks must live in `@/domain-rules/`.
4. **No React dependencies** — callable outside React (Server Actions, scripts, tests).
5. **No UI imports** — zero dependency on any component or visual layer.
6. **Return serializable values** — `string`, `number`, `void`, plain object/array.

## Dependency direction (absolute)

```
app → react-hooks/react-providers → use-cases → server-commands
                                                       ↓
                                              @/firebase/ (repositories)
```

- **server-commands → UI** ❌ forbidden
- **server-commands → react-hooks** ❌ forbidden
- **server-commands → use-cases** ❌ forbidden
