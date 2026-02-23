# Feature Slice: `workspace-core`

## Domain

Workspace management — CRUD, settings, navigation, dashboard shell (sidebar + header).

## Responsibilities

- Create / update workspace
- Mount / unmount capabilities
- Workspace grid and table views
- Workspace navigation tabs
- Dashboard shell: sidebar, account switcher, header, global search, notifications

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createWorkspace`, `updateWorkspace`, `mountCapabilities` |
| `_queries.ts` | Firestore listeners for workspace list |
| `_hooks/` | `useVisibleWorkspaces`, `useApp`, `useAccount` |
| `_components/` | `WorkspacesView`, `WorkspaceCard`, `WorkspaceGridView`, `WorkspaceTableView`, `WorkspaceNavTabs`, `WorkspaceSettings`, `CreateWorkspaceDialog`, `WorkspaceListHeader`, `WorkspaceStatusBar`, `DashboardView`, `WorkspaceList`, `AccountProvider`, `StatCards` |
| `_shell/` | Dashboard chrome: `DashboardSidebar`, `Header`, `AccountSwitcher`, `NavMain`, `NavUser`, `NavWorkspaces`, `GlobalSearch`, `NotificationCenter`, `ThemeAdapter`, `AccountCreateDialog` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { WorkspacesView } from "./_components/workspaces-view";
export { WorkspaceSettings } from "./_components/workspace-settings";
export { DashboardView } from "./_components/dashboard-view";
export { DashboardSidebar } from "./_shell/dashboard-sidebar";
export { Header } from "./_shell/header";
```

## Allowed Imports

```ts
import ... from "@/shared/types";   // Workspace, Capability types
import ... from "@/shared/lib";     // filterVisibleWorkspaces
import ... from "@/shared/infra";   // workspace repository
import ... from "@/shared/ui/...";  // shadcn-ui
// Cross-slice (via public API only):
import ... from "@/features/schedule"; // if workspace layout references schedule
```

## Who Uses This Slice?

- `app/dashboard/layout.tsx` (sidebar + header)
- `app/dashboard/page.tsx`
- `app/dashboard/workspaces/page.tsx`
- `app/dashboard/workspaces/[id]/layout.tsx`
- `app/dashboard/workspaces/@modal/(.)new/page.tsx`
