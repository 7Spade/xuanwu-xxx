# View Modules Layer (`src/view-modules/`)

## Role

Feature-level composable UI modules — the building blocks assembled by `app/` into pages. Each sub-directory owns one domain's visual presentation. Contains no routing logic and no business rule implementations.

## Boundary Rules

- 僅包含 UI 模組（container + presentational components）。
- 可依賴 `react-hooks`、`react-providers`、`server-commands`、`domain-types`、`domain-rules`、`shared`。
- 不得依賴 `firebase`、`genkit-flows`（必須透過 react-hooks 或 server-commands）。
- 不得依賴 `use-cases`（循環依賴：use-cases 已依賴 view-modules 做 re-export）。
- 不得實作業務規則不變條件（邏輯必須在 `use-cases` 或 `domain-rules`）。

## Directory Map

| Module | Primary exports |
|--------|----------------|
| `auth/` | `LoginView`, `ResetPasswordForm` |
| `dashboard/` | `DashboardView`, layout (Header, Sidebar), `AccountNewForm` |
| `user-settings/` | `UserSettingsView` |
| `workspaces/` | `WorkspacesView`, `WorkspaceNavTabs`, `WorkspaceSettings`, plugins barrel |
| `members/` | `MembersView` |
| `partners/` | `PartnersView`, `PartnerDetailView` |
| `teams/` | `TeamsView`, `TeamDetailView` |
| `account/` | `PermissionMatrixView` |

## Allowed Imports

```ts
import ... from "@/react-hooks/..."       // ✅ state, command, service hooks
import ... from "@/react-providers/..."   // ✅ context consumers
import ... from "@/server-commands/..."   // ✅ server actions for mutations
import ... from "@/domain-types/..."      // ✅ type definitions
import ... from "@/domain-rules/..."      // ✅ pure validation helpers
import ... from "@/shared/..."            // ✅ shadcn-ui, utility-hooks, constants
```

## Forbidden Imports

```ts
import ... from "@/firebase/..."          // ❌ go through react-hooks or server-commands
import ... from "@/genkit-flows/..."      // ❌ server-side AI; go through server-commands
import ... from "@/use-cases/..."         // ❌ circular dep (use-cases re-exports view-modules)
import ... from "@/app/..."               // ❌ no upward dependency
```

## Side Effects

View modules produce side effects only via hooks or server-commands they call. No direct Firebase or network calls.

## Who Depends on This Layer?

`src/app/` (pages, layouts, plugin-tab slots) and `src/use-cases/` (for view-bridge re-exports only).
