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
│  │  • qa             —  Quality assurance & verification           │    │
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

Implemented in: `_components/workspace-tabs.tsx`

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

## Cross-Workspace (Account-Level) Projections

Some capabilities have a **second component** that renders an **account-wide aggregated view**
across all workspaces. These are Projection-layer views at the *account* level, NOT workspace capabilities:

| Capability | Workspace component                         | Account (cross-workspace) component              |
|------------|---------------------------------------------|--------------------------------------------------|
| audit      | `capabilities/audit/workspace-audit.tsx`    | `capabilities/audit/organization-audit.component.tsx` |
| daily      | `capabilities/daily/workspace-daily.tsx`    | `capabilities/daily/organization-daily.component.tsx` |
| schedule   | `capabilities/schedule/workspace-schedule.component.tsx` | `capabilities/schedule/organization-schedule.component.tsx` |

The account-level components are consumed by `/dashboard/account/{audit,daily,schedule}` pages.

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
Capability (tasks/qa/acceptance)
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

