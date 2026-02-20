# Domain Rules Layer (`src/domain-rules/`)

## Role

Pure domain logic — business rules and invariant conditions. No I/O, no async, no frameworks. Each sub-directory is one domain aggregate.

## Boundary Rules

- 純業務規則與不變條件（invariants）。
- 只可依賴 `domain-types`。
- 不得依賴任何框架（React、Firebase、Genkit、Next.js）。
- 不得有 I/O、副作用或網路呼叫。
- 不得依賴 `shared`（純邏輯層，無需工具函式）。

## File Naming Convention

Each module uses an **explicit named file** for logic with `index.ts` as a thin re-export barrel:

| Module | Logic file | What it provides |
|--------|-----------|-----------------|
| `account/` | `account.rules.ts` | `isOrganization`, `isOwner`, `getUserTeamIds`, `getMemberRole` |
| `workspace/` | `workspace.rules.ts` | `filterVisibleWorkspaces`, `hasWorkspaceAccess`, `isWorkspaceVisibleToUser` |
| `schedule/` | `schedule.rules.ts` | `canTransitionScheduleStatus`, `VALID_STATUS_TRANSITIONS` |
| `task/` | `task.rules.ts` | `buildTaskTree` |
| `user/` | `user.rules.ts` | `isAnonymousUser` |

## Input / Output Contracts

All functions are **pure**: same input → same output, zero mutations.

| Function | Input | Output |
|----------|-------|--------|
| `isOrganization(account)` | `Account` | `boolean` |
| `isOwner(account, userId)` | `Account`, `string` | `boolean` |
| `getUserTeamIds(account, userId)` | `Account`, `string` | `Set<string>` |
| `filterVisibleWorkspaces(...)` | arrays + domain types | `Workspace[]` |
| `canTransitionScheduleStatus(from, to)` | two `ScheduleStatus` | `boolean` |
| `buildTaskTree(tasks)` | `WorkspaceTask[]` | `TaskWithChildren[]` |

## Side Effects

**None.** Every function is pure.

## Allowed Imports

```ts
import type ... from "@/domain-types/..."  // ✅ type definitions only
```

## Forbidden Imports

```ts
import ... from "react"                    // ❌ no framework
import ... from "firebase/*"               // ❌ no I/O
import ... from "next/*"                   // ❌ no framework
import ... from "@/firebase/..."           // ❌ no data access
import ... from "@/server-commands/..."    // ❌ no orchestration
import ... from "@/shared/..."             // ❌ pure logic layer needs no utilities
import ... from "@/react-hooks/..."        // ❌ no React
import ... from "@/react-providers/..."    // ❌ no React
import ... from "@/use-cases/..."          // ❌ no upward dependency
import ... from "@/view-modules/..."       // ❌ no UI
import ... from "@/genkit-flows/..."       // ❌ no AI
import ... from "@/app/..."                // ❌ no upward dependency
```

## Coding Constraints

1. **No `async` functions** — rules never perform I/O.
2. **No side effects** — every function is pure.
3. **Verb-prefixed exports** — all functions start with `is`, `has`, `can`, `get`, `filter`, or `build`.
4. **All permission logic here** — never place `isOwner` or `hasAccess` checks in hooks or UI.
5. **All state-transition rules here** — never check status validity in server-commands or hooks.

## Who Depends on This Layer?

`src/server-commands/`, `src/use-cases/`, `src/react-hooks/`, `src/view-modules/`.
