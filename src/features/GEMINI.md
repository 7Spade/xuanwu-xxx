# Features Layer (`src/features/`)

## Role

42 vertical feature slices. Each slice is the **single source of truth** for its business domain —
it owns types, server actions, queries, hooks, and UI components.

## The Golden Rule

> An AI assistant implementing any feature reads **only one folder**.

## Slice Index

### Identity Layer

| Slice | Domain | Status |
|-------|--------|--------|
| `identity-account.auth/` | Login, register, reset password | ✅ |

### Account Layer — Shared & Governance

| Slice | Domain | Status |
|-------|--------|--------|
| `account/` | Multi-account provider · AccountGrid · stats (cross-org management UI) | ✅ |
| `account-governance.role/` | Account role management → CUSTOM_CLAIMS signing | 🆕 |
| `account-governance.policy/` | Account policy management | 🆕 |
| `account-governance.notification-router/` | Notification router (FCM Layer 2 — by TargetAccountID) | 🆕 |

### Account Layer — User Sub-type

| Slice | Domain | Status |
|-------|--------|--------|
| `account-user.profile/` | User profile, preferences, FCM token | ✅ |
| `account-user.wallet/` | User personal wallet, balance (stub) | 🔧 |
| `account-user.notification/` | Personal push notification (FCM Layer 3) | 🆕 |
| `account-user.skill/` | Personal skill XP growth · Ledger · Tier derivation (Invariants #11-13) | ✅ |

### Account Layer — Organization Sub-type

| Slice | Domain | Status |
|-------|--------|--------|
| `account-organization.core/` | Organization aggregate entity + binding | 🆕 |
| `account-organization.event-bus/` | Organization event bus | 🆕 |
| `account-organization.member/` | Org-level member invite/remove (stub) | 🔧 |
| `account-organization.team/` | Team management (internal group view) | 🆕 |
| `account-organization.partner/` | Partner management (external group view) | 🆕 |
| `account-organization.policy/` | Organization policy management | 🆕 |
| `account-organization.skill-tag/` | Skill tag pool (flat resource pool) | 🆕 |
| `account-organization.schedule/` | HR scheduling · ScheduleAssigned event (FCM Layer 1) | 🆕 |

### Workspace Application Layer

| Slice | Domain | Status |
|-------|--------|--------|
| `workspace-application/` | Command handler · Scope Guard · Policy Engine · Org-Policy Cache · Transaction Runner · Outbox | 🆕 |

### Workspace Core

| Slice | Domain | Status |
|-------|--------|--------|
| `workspace-core/` | Workspace CRUD, shell, provider, list | ✅ |
| `workspace-core.event-bus/` | Intra-workspace event bus | ✅ |
| `workspace-core.event-store/` | Event store (replay/audit only) | 🆕 |

### Workspace Governance

| Slice | Domain | Status |
|-------|--------|--------|
| `workspace-governance.members/` | Workspace member access & roles | ✅ |
| `workspace-governance.role/` | Role management (split from members) | 🆕 |
| `workspace-governance.teams/` | Stub — team views migrated to `account-organization.team` | 🔧 |
| `workspace-governance.partners/` | Stub — partner views migrated to `account-organization.partner` | 🔧 |
| `workspace-governance.schedule/` | Stub — implementation migrated to `workspace-business.schedule` | 🔧 |
| `workspace-governance.audit/` | Audit trail viewer (workspace + account) · deferred to `workspace-core.event-store` + `projection.account-audit` | ✅ |

### Workspace Business — Support & Static Units

| Slice | Domain | Status |
|-------|--------|--------|
| `workspace-business.daily/` | Daily logs, comments, bookmarks | ✅ |
| `workspace-business.schedule/` | Schedule items, proposals, governance (migrated from `workspace-governance.schedule`) | ✅ |
| `workspace-business.files/` | File upload, management | ✅ |
| `workspace-business.document-parser/` | AI document parsing · ParsingIntent (Digital Twin) | ✅ |

### Workspace Business — A-Track (Main Flow)

| Slice | Domain | Status |
|-------|--------|--------|
| `workspace-business.tasks/` | Task tree, CRUD (A-track start) | ✅ |
| `workspace-business.quality-assurance/` | Quality assurance (A-track) | ✅ |
| `workspace-business.acceptance/` | Acceptance view (A-track) | ✅ |
| `workspace-business.finance/` | Finance processing (A-track end) | ✅ |

### Workspace Business — B-Track (Exception Center)

| Slice | Domain | Status |
|-------|--------|--------|
| `workspace-business.issues/` | Issue tracking · IssueResolved event (B-track) | ✅ |

### Projection Layer

| Slice | Domain | Status |
|-------|--------|--------|
| `projection.event-funnel/` | Event Funnel — EVENT_FUNNEL_INPUT · Projection Layer unified entry point | ✅ |
| `projection.workspace-view/` | Workspace read model (workspace projection view) | ✅ |
| `projection.workspace-scope-guard/` | Scope Guard dedicated read model | ✅ |
| `projection.account-view/` | Account read model · authority snapshot contract | ✅ |
| `projection.account-audit/` | Account audit projection | ✅ |
| `projection.account-schedule/` | Account schedule projection (filter available accounts) | ✅ |
| `projection.organization-view/` | Organization read model | ✅ |
| `projection.account-skill-view/` | Account skill read model (accountId / skillId / xp · tier derived, not stored) | ✅ |
| `projection.org-eligible-member-view/` | Schedule eligibility read model (orgId / accountId / eligible · Invariant #14) | ✅ |
| `projection.registry/` | Event stream offset · read model version table | ✅ |

> **Status legend:** ✅ implemented · 🔧 partial stub (structure created, implementation deferred)

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
import { AccountScheduleSection } from "@/features/workspace-business.schedule";
//                                  ↑ root only, never subpath

// ❌ Forbidden: other slice private paths
import { useWorkspaceSchedule } from "@/features/workspace-business.schedule/_hooks/use-workspace-schedule";
```

## Who Depends on This Layer?

`src/app/` (route files) — imports only from `features/*/index.ts`.
