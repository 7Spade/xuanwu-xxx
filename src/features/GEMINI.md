# Features Layer (`src/features/`)

## Role

20 vertical feature slices. Each slice is the **single source of truth** for its business domain —
it owns types, server actions, queries, hooks, and UI components.

## The Golden Rule

> An AI assistant implementing any feature reads **only one folder**.

## Slice Index

| Slice | Domain |
|-------|--------|
| `account.auth/` | Login, register, reset password |
| `account/` | Organization CRUD, stats, permissions |
| `account-user.profile/` | User profile, preferences, security |
| `account-user.wallet/` | User personal wallet, balance (stub) |
| `account-organization.member/` | Org-level member invite/remove (stub) |
| `workspace-core/` | Workspace CRUD, shell, provider, list |
| `workspace-core.event-bus/` | Intra-workspace event bus |
| `workspace-governance.members/` | Workspace member access & roles |
| `workspace-governance.teams/` | Team structure management |
| `workspace-governance.partners/` | External partner relationships |
| `workspace-governance.schedule/` | Schedule, proposals, decisions |
| `workspace-governance.audit/` | Audit trail, event timeline |
| `workspace-business.daily/` | Daily logs, comments, bookmarks |
| `workspace-business.tasks/` | Task tree, CRUD |
| `workspace-business.files/` | File upload, management |
| `workspace-business.issues/` | Issue tracking |
| `workspace-business.finance/` | Finance plugin |
| `workspace-business.quality-assurance/` | QA plugin |
| `workspace-business.document-parser/` | AI document parsing |
| `workspace-business.acceptance/` | Acceptance plugin |

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
import { AccountScheduleSection } from "@/features/workspace-governance.schedule";
//                                  ↑ root only, never subpath

// ❌ Forbidden: other slice private paths
import { useWorkspaceSchedule } from "@/features/workspace-governance.schedule/_hooks/use-workspace-schedule";

// ❌ Forbidden: legacy layer paths
import { createScheduleItem } from "@/server-commands/schedule";
import { useWorkspaceSchedule } from "@/react-hooks/state-hooks/use-workspace-schedule";
```

## Who Depends on This Layer?

`src/app/` (route files) — imports only from `features/*/index.ts`.
