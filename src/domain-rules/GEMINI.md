# Domain Rules Layer (`src/domain-rules/`)

## Responsibility

Pure domain logic — no I/O, no async, no frameworks.  
Each sub-directory is one domain aggregate.

## File naming convention

Each module uses an **explicit named file** for the logic, with `index.ts` as a thin re-export barrel:

| Module | Logic file | What it provides |
|--------|-----------|-----------------|
| `account/` | `account.rules.ts` | `isOrganization`, `isOwner`, `getUserTeamIds`, `getMemberRole` |
| `workspace/` | `workspace.rules.ts` | `filterVisibleWorkspaces`, `hasWorkspaceAccess`, `isWorkspaceVisibleToUser` |
| `schedule/` | `schedule.rules.ts` | `canTransitionScheduleStatus`, `VALID_STATUS_TRANSITIONS` |
| `task/` | `task.rules.ts` | `buildTaskTree` |
| `user/` | `user.rules.ts` | `isAnonymousUser` |
| `index.ts` | re-exports all sub-modules | — |

## Input / Output contracts

| Function | Input | Output | Throws? |
|----------|-------|--------|---------|
| `isOrganization(account)` | `Account` | `boolean` | No |
| `isOwner(account, userId)` | `Account`, `string` | `boolean` | No |
| `getUserTeamIds(account, userId)` | `Account`, `string` | `Set<string>` | No |
| `filterVisibleWorkspaces(workspaces, userId, activeAccount, allAccounts)` | arrays/records of domain types | `Workspace[]` | No |
| `canTransitionScheduleStatus(from, to)` | two `ScheduleStatus` | `boolean` | No |
| `buildTaskTree(tasks)` | `WorkspaceTask[]` | `TaskWithChildren[]` | No |

## Side effects

**None.** Every function is pure: same input → same output, zero I/O, zero mutation.

## Dependency rules

### Allowed
- `@/domain-types/` — domain interfaces as shapes

### Forbidden
- `react`, `firebase`, `next` — no framework dependencies
- `@/firebase/` — no data access
- `@/server-commands/` — no orchestration
- `@/react-hooks/`, `@/react-providers/` — no React
- `@/view-modules/`, `@/app/` — no UI

## Coding constraints

1. **No `async` functions** — rules never perform I/O.
2. **No side effects** — every function is pure.
3. **Verb-prefixed exports** — all functions start with `is`, `has`, `can`, `get`, `filter`, or `build`.
4. **Single aggregate per module** — each sub-directory encapsulates one domain object.
5. **All permission logic here** — never place `isOwner` or `hasAccess` checks in hooks or UI.
6. **All state-transition rules here** — never check status validity elsewhere.

## Dependency direction (absolute)

```
app → use-cases → server-commands → domain-rules
                                         ↓
                                    (domain-types only)
```

- **domain-rules → server-commands** ❌ forbidden
- **domain-rules → firebase** ❌ forbidden
- **domain-rules → react/firebase/next** ❌ forbidden

## Ideal end state

> Rules 變厚 (rich domain logic) · server-commands 變薄 (thin boundary) · UI 無規則 (zero business logic)
