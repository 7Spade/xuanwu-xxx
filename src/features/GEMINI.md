# Features Layer (`src/features/`)

## Role

17 vertical feature slices. Each slice is the **single source of truth** for its business domain —
it owns types, server actions, queries, hooks, and UI components.

## The Golden Rule

> An AI assistant implementing any feature reads **only one folder**.

## Slice Index

| Slice | Domain |
|-------|--------|
| `auth/` | Login, register, reset password |
| `account/` | Organization CRUD, stats, permissions |
| `workspace/` | Workspace CRUD, settings, dashboard shell |
| `members/` | Member management (account + workspace) |
| `teams/` | Team management |
| `partners/` | Partner management |
| `schedule/` | Schedule items, proposals, governance |
| `daily/` | Daily logs, comments, bookmarks, likes |
| `tasks/` | Task tree, CRUD |
| `audit/` | Audit trail, event timeline |
| `files/` | File upload, management |
| `issues/` | Issue tracking, comments |
| `finance/` | Finance workspace plugin |
| `qa/` | QA workspace plugin |
| `document-parser/` | AI document parsing |
| `acceptance/` | Acceptance workspace plugin |
| `user-settings/` | User profile, preferences, security |

## Standard Slice Layout

```
features/{name}/
├── GEMINI.md        ← AI instructions (required)
├── _actions.ts      ← "use server" mutations (optional)
├── _queries.ts      ← Firestore reads / onSnapshot (optional)
├── _types.ts        ← Feature-specific type extensions (optional)
├── _hooks/          ← React hooks (optional)
├── _components/     ← UI components (optional)
└── index.ts         ← Public API (required)
```

## Import Rules

```ts
// ✅ Allowed: shared infrastructure
import type { ScheduleItem } from "@/shared/types";
import { canTransitionScheduleStatus } from "@/shared/lib";
import { scheduleRepository } from "@/shared/infra";
import { Button } from "@/shared/ui/shadcn-ui/button";

// ✅ Allowed: other slices via public API only
import { AccountScheduleSection } from "@/features/schedule";
//                                  ↑ root only, never subpath

// ❌ Forbidden: other slice private paths
import { useWorkspaceSchedule } from "@/features/schedule/_hooks/use-workspace-schedule";

// ❌ Forbidden: legacy layer paths
import { createScheduleItem } from "@/server-commands/schedule";
import { useWorkspaceSchedule } from "@/react-hooks/state-hooks/use-workspace-schedule";
```

## Who Depends on This Layer?

`src/app/` (route files) — imports only from `features/*/index.ts`.
