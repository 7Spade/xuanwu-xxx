# Use Cases Layer (`src/use-cases/`)

## Role

Application-layer orchestration: combines multiple `server-commands` calls into one atomic workflow. Also provides view-bridge re-exports so `app/` has one stable import surface per domain.

## Boundary Rules

- 負責應用層業務流程編排（≥ 2 個 server-commands 的組合）。
- 可依賴 `server-commands`、`domain-rules`、`domain-types`、`shared`、`view-modules`（僅 re-export）。
- 不得依賴 `firebase` 直接（必須透過 `server-commands`）。
- 不得依賴 `genkit-flows` 直接（必須透過 `server-commands`）。
- 不得依賴 `react-hooks`、`react-providers`（不含 React 狀態）。
- 不得包含 UI 狀態管理或 React 任何引用（orchestration modules 必須是 React-free）。

## Module Map

| Module | Logic file | Key exports |
|--------|-----------|-------------|
| `auth/` | `auth.use-cases.ts` | `completeRegistration` |
| `account/` | `account.use-cases.ts` | `setupOrganizationWithTeam` |
| `workspace/` | `workspace.use-cases.ts` | `createWorkspaceWithCapabilities` |
| `schedule/` | `schedule.use-cases.ts` | `approveScheduleItem`, `rejectScheduleItem` |

## Input / Output Contracts

| Function | Input | Output | Side effects |
|----------|-------|--------|-------------|
| `completeRegistration(email, password, name)` | 3 strings | `Promise<void>` | Firebase Auth + Firestore write |
| `setupOrganizationWithTeam(orgName, owner, teamName, type)` | strings + Account | `Promise<string>` | 2× Firestore writes |
| `createWorkspaceWithCapabilities(name, account, caps)` | strings + Account + Capability[] | `Promise<string>` | 1–2× Firestore writes |
| `approveScheduleItem(item)` | `ScheduleItem` | `Promise<void>` | 1× Firestore write |
| `rejectScheduleItem(item)` | `ScheduleItem` | `Promise<void>` | 1× Firestore write |

## Allowed Imports

```ts
import ... from "@/server-commands/..."   // ✅ Firebase operations
import ... from "@/domain-rules/..."      // ✅ pure validation before calling infra
import ... from "@/domain-types/..."      // ✅ domain interfaces
import ... from "@/shared/..."            // ✅ pure utilities / constants
import ... from "@/view-modules/..."      // ✅ ONLY for view-bridge re-export modules
```

## Forbidden Imports

```ts
import ... from "@/firebase/..."          // ❌ must go through server-commands
import ... from "@/genkit-flows/..."      // ❌ must go through server-commands
import ... from "@/react-hooks/..."       // ❌ orchestration must be React-free
import ... from "@/react-providers/..."   // ❌ no context reads
import ... from "@/app/..."               // ❌ no upward dependency
```

## Rule of Thumb

- If logic combines **≥ 2 server-command calls** → belongs here as an orchestration function.
- If a module only re-exports a view → `index.ts` contains only `export * from "@/view-modules/..."`.
- Orchestration modules: **zero React imports** required.

## Who Depends on This Layer?

`src/react-hooks/` (calls orchestration functions).
