# Feature Slice: `workspace-core`

## Domain

Workspace management — CRUD, settings, navigation, dashboard shell (sidebar + header).

## Responsibilities

- Create / update workspace
- Mount / unmount capabilities (plugins)
- Workspace grid and table views
- Workspace navigation tabs
- Dashboard shell: sidebar, account switcher, header, global search, notifications

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createWorkspace`, `updateWorkspace`, `mountCapabilities` |
| `_queries.ts` | Firestore listeners for workspace list |
| `_hooks/` | `useVisibleWorkspaces`, `useApp` |
| `_components/` | `WorkspacesView`, `WorkspaceCard`, `WorkspaceGridView`, `WorkspaceTableView`, `WorkspaceNavTabs`, `WorkspaceSettings`, `CreateWorkspaceDialog`, `WorkspaceListHeader`, `WorkspaceStatusBar`, `DashboardView`, `WorkspaceList` |
| `_shell/` | Dashboard chrome: `DashboardSidebar`, `Header`, `AccountSwitcher`, `NavMain`, `NavUser`, `NavWorkspaces`, `GlobalSearch`, `NotificationCenter`, `ThemeAdapter`, `AccountCreateDialog` |
| `index.ts` | Public exports |

## Maps From (Legacy)

- `src/server-commands/workspace/` → `_actions.ts`
- `src/use-cases/workspace/` → `_actions.ts` (inline)
- `src/react-hooks/state-hooks/use-visible-workspaces.ts` → `_hooks/`
- `src/react-hooks/state-hooks/use-app.ts` → `_hooks/`
- `src/view-modules/workspaces/` (non-plugin files) → `_components/`
- `src/view-modules/dashboard/` → `_shell/` + `_components/`

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
