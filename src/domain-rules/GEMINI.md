# Project: Entity Layer (`src/entities/`)

## Responsibility

Pure domain logic — no I/O, no async, no frameworks.  
Each sub-directory is one domain aggregate; each `index.ts` contains only pure functions and type guards.

## Directory map

| Module | What it provides |
|--------|-----------------|
| `account/` | `isOrganization`, `isOwner`, `getUserTeamIds`, `getMemberRole` |
| `workspace/` | `filterVisibleWorkspaces`, `hasWorkspaceAccess` |
| `schedule/` | `canTransitionScheduleStatus`, `VALID_STATUS_TRANSITIONS` |
| `user/` | `isAnonymousUser` |
| `index.ts` | re-exports all of the above |

## Dependency rules

### Allowed
- `@/types/` — domain interfaces as shapes
- `@/lib/` — pure utilities

### Forbidden
- `react`, `firebase`, `next` — no framework dependencies
- `@/infra/` — no data access
- `@/actions/` — no orchestration
- `@/hooks/` — no React
- `@/context/` — no React

## Coding constraints

1. **No `async` functions** — entities never perform I/O.
2. **No side effects** — every function is pure (same input → same output).
3. **Verb-prefixed exports** — all exported functions start with `is`, `has`, `can`, `get`, or `filter`.
4. **Single aggregate per module** — each sub-directory encapsulates one domain object.
5. **All permission logic here** — do not place `isOwner` or `hasAccess` checks in hooks or UI.
6. **All state-transition rules here** — do not check status validity anywhere else.

## Migration order (when moving code here)

1. 先抽 Entity — extract pure logic first.
2. 再移動商業規則 — move business rules.
3. 再改寫 Service / Action — simplify the action layer.
4. 最後改寫 UI — UI adjusts last.
5. 每次只移動一個 domain — never refactor multiple domains simultaneously.
6. 每次遷移後必須確保 import 無跨層循環.

## Dependency direction (absolute)

```
app → actions → entities
                   ↓
                 (types / lib only)
```

- **entities → actions** ❌ forbidden
- **entities → infra** ❌ forbidden
- **entities → react/firebase/next** ❌ forbidden

## Ideal end state

> Entity 變厚 (rich domain rules) · Action 變薄 (thin boundary) · UI 無規則 (zero business logic)
