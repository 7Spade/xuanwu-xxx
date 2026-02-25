# Schedule Domain — Complete Development Guide

This guide starts from the pain points that arise in multi-workspace workforce scheduling and works bottom-up to the type system, role boundaries, aggregates, and data flows. Every section maps directly to source files and `logic-overview.v3.md` invariants.

---

## 1. Pain Points and Why They Exist

Understanding why the domain is split across four slices requires understanding the three problems that a naive single-slice design would fail to solve.

### Pain Point 1: Who owns schedule-item state?

A workspace manager creates a shift proposal. An HR director assigns a member to it. A projection tracks the member's availability across all workspaces. Three different actors write to three different records. If one slice owned all three writes, any one actor's failure would roll back the others — which is wrong: HR approval is not the same transaction as creating the item.

**Solution in this codebase:**
- Workspace item creation → `workspace-business.schedule` writes `accounts/{orgId}/schedule_items/{id}`.
- HR assignment decision → `account-organization.schedule` writes `orgScheduleProposals/{id}`.
- Availability index update → `projection.account-schedule` writes `scheduleProjection/{accountId}`, triggered by Event Funnel only.

Each write has exactly one owner. Failed HR approval does not roll back the workspace item.

### Pain Point 2: Cross-workspace skill validation without coupling aggregates

The same member can be in N workspaces. When workspace A assigns a member, it must not read workspace B's data or the Account aggregate's raw skill ledger. A naive design would do `getAccount(memberId)` and check `account.skillGrants[]` — this creates a direct dependency on the Account aggregate from inside the Workspace Container.

**Solution in this codebase:**
- `projection.org-eligible-member-view` is a dedicated read model at `orgEligibleMemberView/{orgId}/members/{accountId}`.
- It stores only `{ skills: { [tagSlug]: { xp } }, eligible, orgId, accountId }`.
- `tier` is never stored — `resolveSkillTier(xp)` is called at validation time (Invariant #12).
- Both `workspace-business.schedule` and `account-organization.schedule` read only this projection (Invariant #14). Neither reads `accounts/*` or `accountSkillGranted` collections.

### Pain Point 3: Availability conflict across workspaces

A member assigned to workspace A for 30 days cannot be double-assigned to workspace B in the same window. Without a cross-workspace availability index, this check requires a full scan of every workspace's schedule items — O(workspaces × items) per assignment.

**Solution in this codebase:**
- `projection.account-schedule` stores `scheduleProjection/{accountId}` with `activeAssignmentIds` and an `assignmentIndex` keyed by `scheduleItemId`.
- The check is O(1): `getAccountActiveAssignments(memberId)` returns the index and filters on `status !== 'completed'`.
- The projection is updated by the Event Funnel after `organization:schedule:assigned` fires — not by the schedule slices directly.

---

## 2. All Roles and Their Responsibilities

### Role 1: Workspace Manager

**Slice:** `workspace-business.schedule`

Responsibilities:
- Creates schedule proposals from the workspace calendar (manual) or automatically via task events.
- Approves or rejects proposals from `PROPOSAL → OFFICIAL` or `PROPOSAL → REJECTED`.
- Assigns and unassigns members to workspace schedule items after availability and skill checks.
- Reads the unified calendar grid showing all `OFFICIAL` items for the workspace.

What this role cannot do:
- Write to `orgScheduleProposals` (owned by HR).
- Bypass skill validation by calling `getAccount()` directly.
- Modify the availability projection — it is read-only from this slice.

### Role 2: HR Director

**Slice:** `account-organization.schedule`

Responsibilities:
- Reviews pending org schedule proposals in the governance panel (`OrgScheduleGovernance`).
- Selects a target member and calls `approveOrgScheduleProposal`, which runs skill validation and publishes `organization:schedule:assigned` or `organization:schedule:assignRejected`.
- Manually cancels proposals with `cancelOrgScheduleProposal` (no event published — no assignment was attempted).

What this role cannot do:
- Write to workspace-level `schedule_items` (owned by Workspace Manager).
- Bypass skill validation — the domain service runs it before confirming.
- Create new schedule items — only workspace proposals arrive at this role.

### Role 3: Event Funnel

**Slices:** `projection.event-funnel` (writer), `projection.account-schedule` (written to)

Responsibilities:
- Receives `organization:schedule:assigned` from the org event bus.
- Calls `applyScheduleAssigned(accountId, assignment)` to update `scheduleProjection/{accountId}`.
- Receives `organization:schedule:assignRejected` and can trigger notifications.
- Will receive `organization:schedule:completed` (not yet implemented) to call `applyScheduleCompleted`.

What this role cannot do:
- Make assignment decisions — it only records facts.
- Write to `schedule_items` or `orgScheduleProposals`.

### Role 4: Personal Account Holder

**Slice:** `workspace-business.schedule` (`AccountScheduleSection`)

Responsibilities:
- Views personal upcoming schedule at `/dashboard/account/schedule`.
- Reads own `schedule_items` filtered from `accountState.schedule_items` via `useGlobalSchedule`.

What this role cannot do:
- Approve or reject proposals — that belongs to Workspace Manager or HR Director.
- Assign other members.

---

## 3. Complete Type Definitions

All types are strict TypeScript — `any` is never used. Canonical file locations are given for each type.

### 3.1 `ScheduleItem` — Workspace-Layer Aggregate Record

```ts
// File: src/shared/types/schedule.types.ts

type ScheduleStatus = 'PROPOSAL' | 'OFFICIAL' | 'REJECTED';

interface ScheduleItem {
  id: string;
  /** The owning organization's account ID. Path: accounts/{accountId}/schedule_items/{id} */
  accountId: string;
  workspaceId: string;
  workspaceName?: string;
  title: string;
  description?: string;
  createdAt: Timestamp;         // Firestore Timestamp
  updatedAt?: Timestamp;        // Firestore Timestamp
  startDate: Timestamp;         // Firestore Timestamp
  endDate: Timestamp;           // Firestore Timestamp
  /** Workspace governance state. Transitions enforced by canTransitionScheduleStatus(). */
  status: ScheduleStatus;
  /** 'MANUAL' = workspace manager created it. 'TASK_AUTOMATION' = auto-created from task event. */
  originType: 'MANUAL' | 'TASK_AUTOMATION';
  /** Present when originType = 'TASK_AUTOMATION'. Traceability to the source task. */
  originTaskId?: string;
  /** Member account IDs currently assigned (arrayUnion/arrayRemove writes). */
  assigneeIds: string[];
  location?: Location;          // From workspace.types.ts
  /** Staffing requirements carried to org layer for skill validation. */
  requiredSkills?: SkillRequirement[];
}
```

Valid status transition table (enforced by `canTransitionScheduleStatus` in `@/shared/lib/schedule.rules.ts`):

| From | To |
|------|----|
| `PROPOSAL` | `OFFICIAL` |
| `PROPOSAL` | `REJECTED` |
| `OFFICIAL` | `REJECTED` |
| `REJECTED` | `PROPOSAL` |

### 3.2 `OrgScheduleProposal` — HR-Layer Aggregate Record

```ts
// File: src/features/account-organization.schedule/_schedule.ts
// Validated by orgScheduleProposalSchema (Zod)

type OrgScheduleStatus = 'draft' | 'proposed' | 'confirmed' | 'cancelled';

interface OrgScheduleProposal {
  /** Foreign key to ScheduleItem.id — also the Firestore document ID. */
  scheduleItemId: string;
  workspaceId: string;
  orgId: string;
  title: string;
  /** ISO-8601 string. Carried from workspace event payload (not Firestore Timestamp). */
  startDate: string;
  endDate: string;
  /** Firebase UID of the workspace manager who proposed. */
  proposedBy: string;
  /** HR governance state machine: draft → proposed → confirmed | cancelled */
  status: OrgScheduleStatus;
  receivedAt: string;           // ISO-8601 — when the WORKSPACE_OUTBOX event was received
  /** SourcePointer: traces to the ParsingIntent that triggered this proposal if origin was TASK_AUTOMATION. */
  intentId?: string;
  /** Carried from ScheduleItem so HR can validate without re-querying workspace data. */
  skillRequirements?: SkillRequirement[];
}
```

HR state transition diagram:

```
draft ──→ proposed ──→ confirmed
                  └──→ cancelled  (HR manual cancel OR skill validation failure)
```

Note: `draft` is in-memory only. The record is always persisted as `proposed` by `handleScheduleProposed`. The `draft` state exists for future batch-import scenarios.

### 3.3 `AccountScheduleProjection` — Availability Read Model

```ts
// File: src/features/projection.account-schedule/_projector.ts

interface AccountScheduleProjection {
  accountId: string;
  /** Fast-path availability check: non-empty = member has active assignments. */
  activeAssignmentIds: string[];
  /** Detail lookup: scheduleItemId → assignment record. */
  assignmentIndex: Record<string, AccountScheduleAssignment>;
  readModelVersion: number;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

interface AccountScheduleAssignment {
  scheduleItemId: string;
  workspaceId: string;
  startDate: string;            // ISO-8601
  endDate: string;              // ISO-8601
  status: 'upcoming' | 'active' | 'completed';
}
```

Usage pattern for availability check:

```ts
// O(1) lookup: check if member has any non-completed assignments
const assignments = await getAccountActiveAssignments(memberId);
const hasConflict = assignments.some(a => a.workspaceId !== item.workspaceId);
```

### 3.4 `OrgEligibleMemberEntry` — Skill Read Model (stored)

```ts
// File: src/features/projection.org-eligible-member-view/_projector.ts
// Firestore path: orgEligibleMemberView/{orgId}/members/{accountId}

interface OrgEligibleMemberEntry {
  orgId: string;
  accountId: string;
  /** Map of tagSlug → { xp }. `tier` is deliberately absent — computed at read time. */
  skills: Record<string, { xp: number }>;
  /** Fast-path flag. Re-verify with skill requirements for authoritative checks. */
  eligible: boolean;
  readModelVersion: number;
  updatedAt: ReturnType<typeof serverTimestamp>;
}
```

### 3.5 `OrgEligibleMemberView` — Skill Read Model (computed, never stored)

```ts
// File: src/features/projection.org-eligible-member-view/_queries.ts
// Returned by getOrgMemberEligibilityWithTier — tier computed via resolveSkillTier(xp)

interface OrgMemberSkillWithTier {
  skillId: string;     // tagSlug
  xp: number;
  tier: SkillTier;     // Derived: resolveSkillTier(xp) — never persisted
}

interface OrgEligibleMemberView {
  orgId: string;
  accountId: string;
  skills: OrgMemberSkillWithTier[];
  eligible: boolean;
}
```

### 3.6 `SkillRequirement` — Staffing Specification

```ts
// File: src/shared/types/skill.types.ts

interface SkillRequirement {
  /** Primary matching key — portable across orgs. Matches SkillGrant.tagSlug. */
  tagSlug: string;
  /** Optional org-local UUID for UI linking. */
  tagId?: string;
  /** Minimum acceptable tier. Compared by rank: titan (7) ≥ grandmaster (5) ≥ apprentice (1). */
  minimumTier: SkillTier;
  /** Number of individuals needed with this skill. Not validated per-assignment (soft guard). */
  quantity: number;
}
```

### 3.7 `SkillTier` — Proficiency Scale

```ts
// File: src/shared/types/skill.types.ts
// XP bounds: src/shared/lib/skill.rules.ts (TIER_DEFINITIONS)

type SkillTier =
  | 'apprentice'    // Rank 1 —    0–74 XP
  | 'journeyman'    // Rank 2 —   75–149 XP
  | 'expert'        // Rank 3 —  150–224 XP
  | 'artisan'       // Rank 4 —  225–299 XP
  | 'grandmaster'   // Rank 5 —  300–374 XP
  | 'legendary'     // Rank 6 —  375–449 XP
  | 'titan';        // Rank 7 —  450–524 XP
```

### 3.8 Cross-Layer Event Payloads

```ts
// File: src/features/workspace-core.event-bus/_events.ts

interface WorkspaceScheduleProposedPayload {
  scheduleItemId: string;
  workspaceId: string;
  orgId: string;
  title: string;
  startDate: string;        // ISO-8601
  endDate: string;          // ISO-8601
  proposedBy: string;       // Firebase UID
  intentId?: string;        // SourcePointer from ParsingIntent
  skillRequirements?: SkillRequirement[];
}

// File: src/features/account-organization.event-bus (org bus contracts)

interface ScheduleAssignedPayload {
  scheduleItemId: string;
  workspaceId: string;
  targetAccountId: string;
  assignedBy: string;
  startDate: string;
  endDate: string;
  title: string;
}

interface ScheduleAssignRejectedPayload {
  scheduleItemId: string;
  orgId: string;
  workspaceId: string;
  targetAccountId: string;
  reason: string;
  rejectedAt: string;       // ISO-8601
}
```

---

## 4. Aggregate and Role Boundary Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WORKSPACE CONTAINER                                                     │
│                                                                          │
│  workspace-business.schedule (Workspace Manager role)                   │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Writes:  accounts/{orgId}/schedule_items/{id}  (ScheduleItem)     │ │
│  │  Reads:   accountState.schedule_items (real-time via AccountCtx)   │ │
│  │  Reads:   projection.account-schedule (availability — read-only)   │ │
│  │  Reads:   projection.org-eligible-member-view (skill — read-only)  │ │
│  │  Publishes: workspace:schedule:proposed → WORKSPACE_OUTBOX         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         │ WORKSPACE_OUTBOX → workspace:schedule:proposed
         ▼ (Event Funnel routes cross-layer)
┌─────────────────────────────────────────────────────────────────────────┐
│  ORGANIZATION LAYER                                                      │
│                                                                          │
│  account-organization.schedule (HR Director role)                       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Writes:  orgScheduleProposals/{scheduleItemId} (OrgScheduleProposal) │
│  │  Reads:   projection.org-eligible-member-view (skill validation)   │ │
│  │  Publishes: organization:schedule:assigned → ORGANIZATION_EVENT_BUS│ │
│  │  Publishes: organization:schedule:assignRejected (compensating)    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         │ ORGANIZATION_EVENT_BUS → organization:schedule:assigned
         ▼ (Event Funnel routes to projections)
┌─────────────────────────────────────────────────────────────────────────┐
│  PROJECTION LAYER                                                        │
│                                                                          │
│  projection.account-schedule (Event Funnel writes, schedule reads)       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Writes:  scheduleProjection/{accountId} (AccountScheduleProjection)│ │
│  │  Writer:  projection.event-funnel ONLY                             │ │
│  │  Reader:  workspace-business.schedule (availability check)         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  projection.org-eligible-member-view (Event Funnel writes, both read)   │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Writes:  orgEligibleMemberView/{orgId}/members/{accountId}        │ │
│  │  Writer:  projection.event-funnel ONLY                             │ │
│  │  Reader:  workspace-business.schedule (soft skill guard)           │ │
│  │  Reader:  account-organization.schedule (hard skill validation)    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Complete Data Flow

### Flow A: Manual Schedule Proposal (UC-1 + UC-9 Org Approval)

```
Actor: Workspace Manager
─────────────────────────────────────────────────────────────────────────
1. Manager clicks "Add to Calendar" for a date.
   → router.push('schedule-proposal?date=2026-03-01')
   → @modal/(.)schedule-proposal intercepts → ScheduleProposalContent renders

2. Form submit → useWorkspace().createScheduleItem(itemData)
   → workspace-provider.tsx: createScheduleItemAction(itemData)
   → @/shared/infra/firestore/firestore.facade: createScheduleItem()
   → WRITE accounts/{orgId}/schedule_items/{newId} { status: 'PROPOSAL', ... }

3. workspace-provider.tsx: eventBus.publish('workspace:schedule:proposed', payload)
   → WORKSPACE_EVENT_BUS fires

4. Event Funnel (`projection.event-funnel/_funnel.ts`):
   bus.subscribe('workspace:schedule:proposed', handleScheduleProposed)
   → account-organization.schedule: handleScheduleProposed(payload)
   → WRITE orgScheduleProposals/{scheduleItemId} { status: 'proposed', ... }

Actor: HR Director
─────────────────────────────────────────────────────────────────────────
5. HR navigates to /dashboard/account/org-schedule
   → OrgScheduleGovernance mounts
   → usePendingScheduleProposals(orgId) subscribes onSnapshot to orgScheduleProposals
     WHERE orgId == orgId AND status == 'proposed'

6. HR selects member, clicks Approve
   → approveOrgScheduleProposal(scheduleItemId, targetAccountId, assignedBy, opts, skillRequirements)

7a. Skill validation (Invariant #14):
    → getOrgMemberEligibility(orgId, targetAccountId)
      reads orgEligibleMemberView/{orgId}/members/{targetAccountId}
    → for each SkillRequirement:
        tier = resolveSkillTier(skillEntry.xp)   // Invariant #12: computed, not stored
        tierSatisfies(tier, req.minimumTier) ? continue : REJECT

7b. On validation pass:
    → WRITE orgScheduleProposals/{id} { status: 'confirmed' }
    → publishOrgEvent('organization:schedule:assigned', { ... })

7c. On validation fail:
    → WRITE orgScheduleProposals/{id} { status: 'cancelled' }
    → publishOrgEvent('organization:schedule:assignRejected', { reason, ... })
    → UI toast: "指派失敗"  [SAGA END — no rollback of workspace schedule_item]

Actor: Event Funnel
─────────────────────────────────────────────────────────────────────────
8. onOrgEvent('organization:schedule:assigned', handler):
   → applyScheduleAssigned(targetAccountId, { scheduleItemId, workspaceId, ... })
   → WRITE scheduleProjection/{accountId}
       .assignmentIndex[scheduleItemId] = { ..., status: 'upcoming' }
       .activeAssignmentIds = arrayUnion(scheduleItemId)

   → upsertProjectionVersion('account-schedule', timestamp)
   → (FCM Layer 2) account-governance.notification-router routes push to member
```

### Flow B: Task-Automation Schedule Proposal (UC-6 / UC-7)

```
Actor: Workspace task system
─────────────────────────────────────────────────────────────────────────
1. workspace:tasks:completed or workspace:tasks:assigned fires on WORKSPACE_EVENT_BUS

2. use-workspace-event-handler.tsx (mounted in WorkspaceProvider):
   → createScheduleItem({
       originType: 'TASK_AUTOMATION',
       originTaskId: payload.task.id,   // or payload.taskId
       assigneeIds: [payload.assigneeId] (UC-7 only),
       status: 'PROPOSAL',
       ...
     })

3. Same as Flow A steps 2–8 from here.
   Note: intentId is NOT forwarded in task-automation proposals (only in ParsingIntent origin).
```

### Flow C: Member Assignment (UC-5 — in-workspace assignment)

```
Actor: Workspace Manager assigning a member directly to a PROPOSAL item
─────────────────────────────────────────────────────────────────────────
1. useScheduleActions().assignMember(item, memberId)

2. Availability check (soft guard, read-only):
   → getAccountActiveAssignments(memberId)
     reads scheduleProjection/{memberId}.assignmentIndex
   → any assignment with status !== 'completed' AND workspaceId !== item.workspaceId → BLOCK

3. Skill check (soft guard, warn-only):
   → getOrgMemberEligibilityWithTier(orgId, memberId)
     reads orgEligibleMemberView/{orgId}/members/{memberId}
   → for each SkillRequirement in item.requiredSkills:
       skillEntry = memberView.skills.find(s => s.skillId === req.tagSlug)
       !tierSatisfies(skillEntry.tier, req.minimumTier) → toast warning + BLOCK

4. On pass:
   → assignMemberAction(item.accountId, item.id, memberId)
   → WRITE accounts/{orgId}/schedule_items/{id}
       .assigneeIds = arrayUnion(memberId)
```

### Flow D: B-Track Recovery (UC-8 — Discrete Recovery Principle)

```
Actor: Issues slice resolving a B-track issue
─────────────────────────────────────────────────────────────────────────
1. workspace:issues:resolved fires on WORKSPACE_EVENT_BUS
   payload: { issueId, issueTitle, resolvedBy, sourceTaskId? }

2. use-workspace-event-handler.tsx subscribes:
   → if payload.sourceTaskId: updateTask(sourceTaskId, { progressState: 'todo' })
   → pushNotification("B-Track Issue Resolved", ...)

3. useScheduleEventHandler (in workspace-business.schedule) subscribes:
   → surface toast: "Issue resolved — you may now resume blocked schedule items"
   → NO automatic write to schedule_items
   → User decides which items to resume (Invariant #2: B-track does not write A-track)
```

### Flow E: Availability Projection Completion (future UC-10)

```
(Not yet implemented — handler exists, event not yet published)
─────────────────────────────────────────────────────────────────────────
When organization:schedule:completed fires:
   → applyScheduleCompleted(accountId, scheduleItemId)
   → WRITE scheduleProjection/{accountId}
       .assignmentIndex[scheduleItemId].status = 'completed'
       .activeAssignmentIds = arrayRemove(scheduleItemId)
   → Member becomes available for new assignments
```

---

## 6. Aggregate Boundary Summary

| Aggregate | Firestore Collection | Owner Slice | Write Method |
|-----------|---------------------|-------------|-------------|
| Workspace ScheduleItem | `accounts/{orgId}/schedule_items/{id}` | `workspace-business.schedule` | `createScheduleItem`, `updateScheduleItemStatus`, `assignMemberToScheduleItem` via `firestore.facade` |
| OrgScheduleProposal | `orgScheduleProposals/{scheduleItemId}` | `account-organization.schedule` | `setDocument` / `updateDocument` in `_schedule.ts` |
| AccountScheduleProjection | `scheduleProjection/{accountId}` | `projection.event-funnel` (writes `_projector.ts`) | `applyScheduleAssigned`, `applyScheduleCompleted` |
| OrgEligibleMemberEntry | `orgEligibleMemberView/{orgId}/members/{accountId}` | `projection.event-funnel` (writes `_projector.ts`) | `initOrgMemberEntry`, `applyOrgMemberSkillXp` |

Rule: every `WRITE` to a collection must come from its owner slice. Any violation breaks Invariant #1.

---

## 7. Invariant Reference Card

Quick-reference for code review. Each invariant maps to a concrete code location.

| # | Invariant | Where Enforced |
|---|-----------|---------------|
| 1 | Each BC writes only its own aggregate | `_schedule.ts` writes only `orgScheduleProposals`; `_actions.ts` writes only `schedule_items` |
| 2 | Cross-BC reads via Event/Projection only | `useScheduleActions` reads `projection.*`, not `accounts/*` |
| 12 | Tier is never stored — computed at runtime | `resolveSkillTier(xp)` in `approveOrgScheduleProposal`; `tier` field absent from `OrgEligibleMemberEntry` |
| 14 | Schedule reads only `org-eligible-member-view` for member skills | Both `useScheduleActions` and `approveOrgScheduleProposal` call only projection queries |
| A5 | `organization:schedule:assignRejected` is the compensating event for failed approvals | `_cancelProposal()` in `_schedule.ts` — only called from `approveOrgScheduleProposal`, not from `cancelOrgScheduleProposal` |

---

## 8. Multi-Workspace Patterns (Modern Next.js)

This section covers the specific challenges of a multi-workspace deployment where members can be assigned across workspaces simultaneously.

### 8.1 Real-Time Availability Without Cross-Workspace Reads

The `AccountProvider` subscribes to `accounts/{orgId}/schedule_items` once, giving the active workspace a real-time view of all org items. The availability check uses `projection.account-schedule` — a cross-workspace summary keyed by member, not by workspace. This avoids subscribing to every workspace's `schedule_items`.

```ts
// O(1) cross-workspace availability check — no cross-workspace Firestore read
const assignments = await getAccountActiveAssignments(memberId);
const isUnavailable = assignments.some(a =>
  a.status !== 'completed' && a.workspaceId !== currentWorkspaceId
);
```

### 8.2 Optimistic Updates for Assignment Actions

`useScheduleActions` performs a pre-flight availability check and then writes. For snappy UI, wrap the write in React's `useOptimistic`:

```ts
// Pattern for adding optimistic assignment to a schedule item
const [optimisticItem, addOptimistic] = useOptimistic(
  item,
  (current, newMemberId: string) => ({
    ...current,
    assigneeIds: [...current.assigneeIds, newMemberId],
  })
);

const handleAssign = async (memberId: string) => {
  addOptimistic(memberId);          // Instant UI update
  await assignMember(item, memberId); // Real Firestore write
};
```

The AccountProvider's real-time `onSnapshot` will confirm or revert once the write lands. This pattern prevents the double-render flicker common in Firebase + React apps.

### 8.3 `useActionState` for Proposal Submission Forms

`ScheduleProposalContent` submits a new schedule proposal. Using `useActionState` from React 19 gives pending state and server-returned errors without extra local state:

```ts
// In ScheduleProposalContent — proposal creation with pending state
'use client';
import { useActionState, startTransition } from 'react';

const [state, submitAction, isPending] = useActionState(
  async (prev: FormState, formData: FormData) => {
    try {
      await createScheduleItem({ ...parseFormData(formData) });
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
  { success: false }
);
```

### 8.4 Parallel Route Slot Lifecycle

The workspace `[id]` layout composes `@businesstab`, `@modal`, and `@panel` in parallel. The schedule-related slots:

```
workspaces/[id]/
├── layout.tsx                  ← composes @businesstab, @modal, @panel
├── @businesstab/
│   └── schedule/
│       ├── page.tsx            ← WorkspaceSchedule (real-time calendar)
│       └── loading.tsx         ← Skeleton while calendar data loads
├── @modal/
│   └── (.)schedule-proposal/
│       └── page.tsx            ← ScheduleProposalContent (form dialog)
└── @panel/
    └── (.)governance/
        └── page.tsx            ← GovernanceSidebar (approve/reject list)
```

`@modal` and `@panel` each have `default.tsx` returning `null` — they are invisible when not intercepted. The canonical routes `schedule-proposal/page.tsx` and `governance/page.tsx` exist for direct URL access.

### 8.5 `useSelectedLayoutSegment` for Active Tab Highlighting

Use `useSelectedLayoutSegment('businesstab')` in the layout to highlight the active tab in the nav bar without separate state:

```ts
'use client';
import { useSelectedLayoutSegment } from 'next/navigation';

export function WorkspaceNav() {
  const segment = useSelectedLayoutSegment('businesstab');
  return (
    <nav>
      <Link
        href={`schedule`}
        data-active={segment === 'schedule'}
        className="data-[active=true]:font-bold"
      >
        Schedule
      </Link>
    </nav>
  );
}
```

### 8.6 Date Handling: Firestore Timestamp vs ISO String

`ScheduleItem.startDate` uses `Firestore Timestamp` — mandatory for `orderBy` and range queries in Firestore.
`OrgScheduleProposal.startDate` uses `string` (ISO-8601) — the proposal is persisted from a workspace event payload that has already serialized the date.

When converting at boundaries:

```ts
// ScheduleItem → OrgScheduleProposal (in workspace-provider.tsx event publish)
startDate: item.startDate.toDate().toISOString(),

// OrgScheduleProposal → AccountScheduleAssignment (in Event Funnel)
startDate: proposal.startDate, // already ISO string — pass through

// Display (in components)
import { format } from 'date-fns';
format(new Date(proposal.startDate), 'yyyy-MM-dd');
```

Never pass a `Timestamp` object across the workspace→org boundary (event payloads must be JSON-serializable).

---

## 9. Implementation Checklist

Use this checklist before merging any schedule-related change.

### Adding a new schedule use case

1. **Identify the actor.** Workspace Manager → `workspace-business.schedule`. HR Director → `account-organization.schedule`. Neither → check if this belongs in a new slice.

2. **Identify the write target.**
   - `accounts/{orgId}/schedule_items` → belongs in `_actions.ts` (via `firestore.facade`).
   - `orgScheduleProposals` → belongs in `_schedule.ts`.
   - Any projection → belongs in `projection.event-funnel` triggered by an event.

3. **Define the type.** Shared across slices → `@/shared/types/schedule.types.ts`. Slice-private → inline in the owning file.

4. **Add the domain rule.** Pure function (no I/O) → `@/shared/lib/schedule.rules.ts`. Slice-specific guard → inline in the domain service or hook.

5. **Add or update the event contract.** Workspace event → `workspace-core.event-bus/_events.ts` `WorkspaceEventPayloadMap`. Org event → org event bus contracts. Register funnel handler in `projection.event-funnel/_funnel.ts`.

6. **Add the route.** Modal overlay → `@modal/(.)target/page.tsx` + canonical `target/page.tsx`. Panel → `@panel/(.)target/page.tsx` + canonical `target/page.tsx`. Add `loading.tsx` for `@businesstab` tabs.

7. **Validate boundaries.**
   - No `_` private imports from outside the slice.
   - No direct `getDocument('accounts/...')` from `account-organization.schedule`.
   - No `tier` field stored in Firestore.
   - No `getAccount()` call from any schedule hook or domain service.

### Modifying the skill validation path

- Always use `getOrgMemberEligibility` (raw) for `approveOrgScheduleProposal` — hard validation.
- Always use `getOrgMemberEligibilityWithTier` (computed) for `useScheduleActions` — soft guard that needs tier for the warning message.
- Never cache tier — call `resolveSkillTier(xp)` at each validation site.

### Adding a new schedule status

- Add the new status to `ScheduleStatus` in `shared/types/schedule.types.ts`.
- Add all valid transitions FROM and TO the new status in `VALID_STATUS_TRANSITIONS` in `shared/lib/schedule.rules.ts`.
- If the new status requires a org-level event, add it to the org event bus and register in the funnel.

---

## 10. Anti-Pattern Reference

```ts
// ─── AGGREGATE BOUNDARY ────────────────────────────────────────────────

// Bad: workspace slice reads Account aggregate for skill validation
const account = await getDocument<Account>(`accounts/${memberId}`);
const xp = account.skillGrants.find(g => g.tagSlug === 'crane-operation')?.xp;
// Good: read only the designated projection
const view = await getOrgMemberEligibility(orgId, memberId);
const xp = view?.skills['crane-operation']?.xp;

// Bad: org schedule slice writes workspace schedule item
await updateDocument(`accounts/${orgId}/schedule_items/${id}`, { status: 'OFFICIAL' });
// Good: workspace item status is owned by workspace-business.schedule
// org slice only writes orgScheduleProposals

// Bad: projection slice receives direct write from schedule slice
await applyScheduleAssigned(accountId, assignment); // from _actions.ts or _schedule.ts
// Good: only projection.event-funnel calls applyScheduleAssigned

// ─── TYPE SYSTEM ────────────────────────────────────────────────────────

// Bad: store computed tier in Firestore
await updateDocument(`orgEligibleMemberView/${orgId}/members/${accountId}`, {
  'skills.crane-operation.tier': 'expert',
});
// Good: store only xp; derive tier at read time
await updateDocument(..., { 'skills.crane-operation': { xp: 180 } });
const tier = resolveSkillTier(180); // 'expert' at runtime, never persisted

// Bad: pass Timestamp across BC event boundary
eventBus.publish('workspace:schedule:proposed', {
  startDate: item.startDate, // Firestore Timestamp — not JSON-serializable
});
// Good: convert to ISO string at the boundary
eventBus.publish('workspace:schedule:proposed', {
  startDate: item.startDate.toDate().toISOString(),
});

// ─── SLICE BOUNDARY ─────────────────────────────────────────────────────

// Bad: import private file from outside the slice
import { approveOrgScheduleProposal } from '@/features/account-organization.schedule/_schedule';
// Good: import from the slice's public API
import { approveOrgScheduleProposal } from '@/features/account-organization.schedule';

// Bad: cancel proposal emits ScheduleAssignRejected
await cancelOrgScheduleProposal(id);
await publishOrgEvent('organization:schedule:assignRejected', { ... }); // wrong
// Good: cancel is an HR withdrawal — no assignment was attempted, no compensating event needed

// ─── DISCRETE RECOVERY ──────────────────────────────────────────────────

// Bad: issues slice writes directly to schedule items to "unblock"
// (from workspace-business.issues)
await updateScheduleItemStatus(accountId, itemId, 'PROPOSAL');
// Good: issues slice publishes event; schedule slice subscribes and surfaces a toast;
// the workspace manager decides which items to resume

// ─── REACT PATTERNS ─────────────────────────────────────────────────────

// Bad: no optimistic update for assignment — laggy UX
await assignMember(item, memberId);
// Good: optimistic update + real-time confirmation via AccountProvider onSnapshot
addOptimistic(memberId);
await assignMember(item, memberId);

// Bad: polling for availability after assignment
setInterval(() => checkAvailability(memberId), 2000);
// Good: AccountProvider's onSnapshot fires automatically after Firestore write
// No polling needed — the real-time listener confirms in <200ms
```

---

## 11. Slice Boundary Validation Table

| Slice | Owns its Firestore writes | Cross-BC reads via Projection only | No `_` private imports from outside | Complete business flow |
|-------|--------------------------|-----------------------------------|------------------------------------|----------------------|
| `workspace-business.schedule` | Yes — `schedule_items` | Yes — `projection.account-schedule`, `projection.org-eligible-member-view` | Yes | Yes (UC-1, UC-4, UC-5, UC-6, UC-7, UC-8) |
| `account-organization.schedule` | Yes — `orgScheduleProposals` | Yes — `projection.org-eligible-member-view` | Yes | Yes (UC-2, UC-3) |
| `workspace-governance.schedule` | No active code | No active code | Yes | Stub |
| `projection.account-schedule` | Written by Event Funnel only | Read-only from schedule slices | Yes | Yes (UC-9) |

---

## 12. File Map

| File | Slice | Purpose |
|------|-------|---------|
| `shared/types/schedule.types.ts` | Shared | `ScheduleItem`, `ScheduleStatus` |
| `shared/types/skill.types.ts` | Shared | `SkillTier`, `SkillGrant`, `SkillRequirement`, `SkillTag` |
| `shared/lib/schedule.rules.ts` | Shared | `canTransitionScheduleStatus`, `VALID_STATUS_TRANSITIONS` |
| `shared/lib/skill.rules.ts` | Shared | `resolveSkillTier`, `tierSatisfies`, `TIER_DEFINITIONS` |
| `workspace-business.schedule/_actions.ts` | workspace-business.schedule | `createScheduleItem`, `updateScheduleItemStatus`, `assignMember`, `unassignMember` |
| `workspace-business.schedule/_hooks/use-schedule-commands.ts` | workspace-business.schedule | `useScheduleActions` — availability + skill guards + write orchestration |
| `workspace-business.schedule/_hooks/use-global-schedule.ts` | workspace-business.schedule | `useGlobalSchedule` — account-level pending/decision/upcoming views |
| `workspace-business.schedule/_hooks/use-workspace-schedule.ts` | workspace-business.schedule | `useWorkspaceSchedule` — workspace-scoped calendar state |
| `workspace-business.schedule/_hooks/use-schedule-event-handler.ts` | workspace-business.schedule | `useScheduleEventHandler` — B-track recovery subscription |
| `account-organization.schedule/_schedule.ts` | account-organization.schedule | `handleScheduleProposed`, `approveOrgScheduleProposal`, `cancelOrgScheduleProposal`; `OrgScheduleProposal` type + Zod schema |
| `account-organization.schedule/_queries.ts` | account-organization.schedule | `subscribeToOrgScheduleProposals`, `subscribeToPendingProposals` |
| `account-organization.schedule/_hooks/use-org-schedule.ts` | account-organization.schedule | `useOrgSchedule`, `usePendingScheduleProposals` |
| `account-organization.schedule/_components/org-schedule-governance.tsx` | account-organization.schedule | `OrgScheduleGovernance` — HR panel |
| `projection.account-schedule/_projector.ts` | projection.account-schedule | `applyScheduleAssigned`, `applyScheduleCompleted`; `AccountScheduleProjection` type |
| `projection.account-schedule/_queries.ts` | projection.account-schedule | `getAccountActiveAssignments` |
| `projection.org-eligible-member-view/_projector.ts` | projection.org-eligible-member-view | `applyOrgMemberSkillXp`, `initOrgMemberEntry`; `OrgEligibleMemberEntry` type |
| `projection.org-eligible-member-view/_queries.ts` | projection.org-eligible-member-view | `getOrgMemberEligibility`, `getOrgMemberEligibilityWithTier` |
| `workspace-core/_components/workspace-provider.tsx` | workspace-core | `createScheduleItem` with outbox event publish |
| `workspace-core/_components/account-provider.tsx` | workspace-core | Real-time `schedule_items` subscription for `AccountState` |
| `workspace-core/_hooks/use-workspace-event-handler.tsx` | workspace-core | Task-automation schedule proposals (UC-6, UC-7) |
| `projection.event-funnel/_funnel.ts` | projection.event-funnel | Routes `workspace:schedule:proposed` → `handleScheduleProposed`; routes `organization:schedule:assigned` → `applyScheduleAssigned` |
