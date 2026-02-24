# Workspace Architecture: Four-Layer Model

This document defines the structural boundaries of the Workspace capability system.
All changes to workspace capabilities MUST respect these layer definitions.

---

## Layer Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WORKSPACE  /dashboard/workspaces/[id]                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Layer 1 — CORE                                  [always shown] │    │
│  │  Responsibility: Workspace lifecycle & capability management    │    │
│  │                                                                 │    │
│  │  • capabilities  —  Mounts / unmounts Business capabilities     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Layer 2 — GOVERNANCE                            [always shown] │    │
│  │  Responsibility: Access control, roles & permissions            │    │
│  │                                                                 │    │
│  │  • members  —  Team authorization & individual access grants    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Layer 3 — BUSINESS                              [mountable]    │    │
│  │  Responsibility: Product features & operational capabilities    │    │
│  │                                                                 │    │
│  │  • tasks          —  Task tracking & progress                   │    │
│  │  • quality-assurance  —  Quality assurance & verification           │    │
│  │  • acceptance     —  Deliverable acceptance                     │    │
│  │  • finance        —  Budget & disbursement tracking             │    │
│  │  • issues         —  Issue & conflict management                │    │
│  │  • files          —  Document & asset management                │    │
│  │  • daily          —  Workspace-scoped activity wall             │    │
│  │  • schedule       —  Workspace timeline (proposer view)         │    │
│  │  • document-parser — AI-powered document extraction            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Layer 4 — PROJECTION                            [always shown] │    │
│  │  Responsibility: Read models & query-optimised views            │    │
│  │                                                                 │    │
│  │  • audit  —  Workspace event stream (local, read-only)          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tab Order

`Core` → `Governance` → `[Business tabs in mount order]` → `Projection`

Implemented in: `_route-components/workspace-tabs.tsx`

---

## Layer Rules

| Layer      | Always shown? | Mountable? | User-owned? | Org-owned? |
|------------|:-------------:|:----------:|:-----------:|:----------:|
| Core       | ✅            | ❌         | ✅          | ✅         |
| Governance | ✅            | ❌         | ✅          | ✅         |
| Business   | ❌            | ✅         | subset*     | ✅         |
| Projection | ✅            | ❌         | ✅          | ✅         |

\* Personal (user-owned) workspaces may only mount: `tasks`, `files`, `daily`, `issues`, `schedule`, `document-parser`

---

## "One Core, Two Views" Pattern

Several capabilities have **two view implementations** sharing the same core data model:

- `{capability}.workspace.tsx` — **Workspace view**: scoped to a single workspace
- `{capability}.account.tsx` — **Account view**: aggregated across all workspaces in the account

```
Capability (e.g. audit)
      │
      ├─ audit.workspace-view.tsx  ←── Used by: workspace-tabs.tsx [Projection tab]
      │   WorkspaceAudit          Context: single workspace
      │   Scope: local events      Data: localAuditLogs from WorkspaceContext
      │
      └─ audit.account-view.tsx   ←── Used by: /dashboard/account/audit page
          AccountAuditComponent   Context: entire account dimension
          Scope: cross-workspace  Data: auditLogs from AccountContext
```

### Dual-view capabilities

| Capability | Workspace view file            | Account view file             | Workspace scope       | Account scope              |
|------------|-------------------------------|-------------------------------|----------------------|----------------------------|
| `audit`    | `audit/audit.workspace-view.tsx`   | `audit/audit.account-view.tsx`     | Local event stream   | All-workspace event log     |
| `daily`    | `daily/daily.workspace-view.tsx`   | `daily/daily.account-view.tsx`     | Write + read (feed)  | Aggregated read-only wall   |
| `schedule` | `schedule/schedule.workspace-view.tsx` | `schedule/schedule.account-view.tsx` | Proposer view     | Governor view (approve/reject) |

The account-level components are consumed by `/dashboard/account/{audit,daily,schedule}` pages.

### File naming rules

- Always use `{capability}.workspace.tsx` for the workspace-scoped view
- Always use `{capability}.account.tsx` for the account-scoped aggregated view
- Export function names: `WorkspaceXxx` for workspace views, `AccountXxxComponent` for account views
- Barrel re-exports for workspace views live in `@businesstab/` (workspace views only)

---

## Workspace Creation Flow

```
[User / Organization]
        │
        │ createWorkspace(data)
        ▼
[WorkspaceRepository.createWorkspace()]
        │  ──> Check: caller must be User / Organization
        ▼
[Firebase Firestore / Storage Adapter]
        │  ──> create workspace doc / initialize folders
        ▼
[Workspace Initialized]
        │
        ├─ WorkspaceEventBus Initialization
        │    ├─ Route / Filter
        │    └─ Policy / Permission Check
        │
        └─ Capabilities can be mounted within the Workspace (Layer 3 — Business)
```

## Capability Event Flow

```
Capability (tasks/quality-assurance/acceptance)
       │
       │ emit(event)
       │  ──> event payload
       ▼
WorkspaceEventBus
 ├─ Route / Filter ──> Confirm which Capabilities are subscribed to this event
 ├─ Policy / Permission Check ──> Confirm the event initiation Capability's permissions
 └─ Send the event to subscribed Capabilities within the same Workspace
       │
       ▼
Subscribed Capability(s)
 ├─ Receive event payload
 ├─ Update status / UI
 └─ When data needs to be written
       │
       ▼
WorkspaceRepository
 ├─ Read / Write request
 ├─ Permission check (confirms the Capability can operate on Workspace resources)
 └─ Call Adapter
       │
       ▼
Firebase Adapter
 ├─ Read Adapter ──> Retrieve data
 └─ Write Adapter ──> Write data (Firestore / Storage)
```

