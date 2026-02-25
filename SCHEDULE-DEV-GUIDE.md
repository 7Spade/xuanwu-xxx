# Schedule Feature Development Guide

This guide covers the complete schedule domain: all four vertical slices, their business use cases, cross-slice event contracts, Firestore schema, and the App Router route map. Read this before adding any schedule-related code.

---

## Scope and Slice Overview

The schedule domain spans four vertical slices, each representing one distinct business flow:

| Slice | Business Role | Bounded Context |
|-------|--------------|----------------|
| `workspace-business.schedule` | Workspace schedule items, proposals, governance decisions | Workspace Container |
| `account-organization.schedule` | HR workforce scheduling, skill validation, compensating events | Organization Layer |
| `workspace-governance.schedule` | Stub — no active code; implementation lives in `workspace-business.schedule` | Workspace Container |
| `projection.account-schedule` | Account availability read model (event-driven, written by Event Funnel only) | Projection Layer |

Two supporting projections are consumed by the schedule domain but are not schedule-owned:

| Projection | Consumed By |
|-----------|------------|
| `projection.org-eligible-member-view` | `workspace-business.schedule` (soft guard) and `account-organization.schedule` (hard skill validation) |

---

## Business Use Cases

Each use case maps to exactly one owning slice. No use case crosses slice boundaries for writes.

### UC-1: Create a Workspace Schedule Proposal

**Owner:** `workspace-business.schedule`

1. User opens the proposal dialog from the workspace calendar (navigates to `schedule-proposal`).
2. `ScheduleProposalContent` calls `createScheduleItem` from `_actions.ts` via `useWorkspace().createScheduleItem`.
3. `workspace-provider.tsx` writes to `accounts/{orgId}/schedule_items/{itemId}` with `status: PROPOSAL`.
4. Immediately after the Firestore write, `workspace-provider.tsx` publishes `workspace:schedule:proposed` to the workspace event bus (cross-layer Outbox pattern per `logic-overview.v3.md`).
5. The Event Funnel intercepts `workspace:schedule:proposed` and calls `handleScheduleProposed` from `account-organization.schedule`.
6. `account-organization.schedule` persists `orgScheduleProposals/{scheduleItemId}` with `status: proposed`.

```ts
// Good: proposal creation path — workspace-business.schedule owns the write
const itemId = await createScheduleItemFacade(itemData);
eventBus.publish('workspace:schedule:proposed', { scheduleItemId: itemId, ... });

// Bad: publishing the org event directly from the workspace slice
await publishOrgEvent('organization:schedule:assigned', ...); // violates Invariant #1
```

---

### UC-2: HR Approves an Org Schedule Proposal

**Owner:** `account-organization.schedule`

1. HR navigates to `/dashboard/account/org-schedule`.
2. `OrgScheduleGovernance` renders pending proposals from `usePendingScheduleProposals`.
3. HR selects a member and clicks approve.
4. `approveOrgScheduleProposal` validates the member's skill tiers against `projection.org-eligible-member-view` (Invariant #14 — never reads Account aggregate).
5. Tier is computed via `resolveSkillTier(xp)` at runtime — never stored in any DB field (Invariant #12).
6. On success: updates `orgScheduleProposals/{id}` to `confirmed` and publishes `organization:schedule:assigned`.
7. On failure: updates status to `cancelled` and publishes compensating event `organization:schedule:assignRejected` (Invariant A5).

```ts
// Good: reads only the Projection for skill validation (Invariant #14)
const memberView = await getOrgMemberEligibility(orgId, targetAccountId);
const tier = resolveSkillTier(memberView.skills[req.tagSlug].xp); // derived at runtime

// Bad: reading Account aggregate directly
const account = await getAccount(targetAccountId); // violates Invariant #14
```

---

### UC-3: HR Cancels an Org Schedule Proposal

**Owner:** `account-organization.schedule`

1. HR clicks "Cancel" on a pending proposal in `OrgScheduleGovernance`.
2. `cancelOrgScheduleProposal` updates `orgScheduleProposals/{id}` to `cancelled`.
3. No event is published — this is an explicit HR withdrawal, not a failed assignment attempt.

This path is distinct from the compensating event inside `approveOrgScheduleProposal` (UC-2, failure branch): cancellation happens before any assignment is attempted, so there is no `ScheduleAssignRejected` to emit.

---

### UC-4: Workspace Governance Approve or Reject

**Owner:** `workspace-business.schedule`

1. The workspace manager navigates to the governance panel (intercepted as a `@panel` sheet, or canonical `/governance` route).
2. `GovernanceSidebar` renders workspace-scoped items in `PROPOSAL` status from `accountState.schedule_items`.
3. `approveItem` and `rejectItem` from `useScheduleActions` call `updateScheduleItemStatus`.
4. Writes to `accounts/{orgId}/schedule_items/{itemId}` with `status: OFFICIAL` or `REJECTED`.
5. Valid transitions: `PROPOSAL → OFFICIAL`, `PROPOSAL → REJECTED`, `OFFICIAL → REJECTED`. Enforced by `canTransitionScheduleStatus` from `@/shared/lib`.

```ts
// Good: guard state transition with the domain rule from shared/lib
if (!canTransitionScheduleStatus(item.status, 'OFFICIAL')) {
  throw new Error(`Cannot approve: invalid transition ${item.status} → OFFICIAL`);
}
await updateScheduleItemStatus(item.accountId, item.id, 'OFFICIAL');

// Bad: bypass the transition guard
await updateScheduleItemStatus(item.accountId, item.id, 'OFFICIAL'); // always writes, no guard
```

---

### UC-5: Assign a Member to a Schedule Item

**Owner:** `workspace-business.schedule`

1. User triggers `useScheduleActions().assignMember(item, memberId)`.
2. Availability check: `getAccountActiveAssignments(memberId)` from `projection.account-schedule` — ensures no conflicting active assignments across workspaces (Invariant #14).
3. Soft skill guard: `getOrgMemberEligibilityWithTier` from `projection.org-eligible-member-view` — warns if skill requirements are unmet. This is a UX hint; hard validation happens in `approveOrgScheduleProposal` (UC-2).
4. On pass: `assignMemberAction` writes `assigneeIds: arrayUnion(memberId)` to `accounts/{orgId}/schedule_items/{itemId}`.

---

### UC-6: B-Track Issue Resolved — Schedule Recovery

**Owner:** `workspace-business.schedule`

1. `workspace-business.issues` publishes `workspace:issues:resolved` to the workspace event bus.
2. `useScheduleEventHandler` (mounted by `WorkspaceSchedule`) subscribes to this event.
3. A toast notification surfaces: the schedule layer does NOT automatically modify items. The user decides which blocked items to resume.

This is the **discrete recovery principle**: B-track resolves independently; it does not flow back into A-track writes directly (per `logic-overview.v3.md` Invariant #2).

---

### UC-7: Account Schedule Projection Updated

**Owner:** `projection.account-schedule` (written by Event Funnel, never by schedule slices)

1. `organization:schedule:assigned` event arrives from `account-organization.schedule` into `ORGANIZATION_EVENT_BUS`.
2. Event Funnel routes it to `applyScheduleAssigned(accountId, assignment)`.
3. Projection stored at `scheduleProjection/{accountId}`:
   - `assignmentIndex[scheduleItemId]` records `{ workspaceId, startDate, endDate, status: upcoming }`.
   - `activeAssignmentIds` grows by `arrayUnion(scheduleItemId)`.
4. When a future `organization:schedule:completed` event is added, `applyScheduleCompleted` removes the item from `activeAssignmentIds`.

```ts
// Good: projection is written ONLY from the Event Funnel handler
bus.subscribe('organization:schedule:assigned', async (payload) => {
  await applyScheduleAssigned(payload.targetAccountId, { ... });
});

// Bad: schedule slice writes directly to the projection
await applyScheduleAssigned(accountId, assignment); // from _actions.ts — violates Projection contract
```

---

## Firestore Collections

| Collection Path | Owned By | Type |
|----------------|---------|------|
| `accounts/{orgId}/schedule_items/{itemId}` | `workspace-business.schedule` | `ScheduleItem` |
| `orgScheduleProposals/{scheduleItemId}` | `account-organization.schedule` | `OrgScheduleProposal` |
| `scheduleProjection/{accountId}` | `projection.account-schedule` (Event Funnel writes) | `AccountScheduleProjection` |

Each collection is owned by exactly one bounded context. No slice writes to another slice's collection.

---

## Event Contracts

All events use the `shared-kernel.event-envelope` contract.

### Cross-Layer Events (WORKSPACE_OUTBOX → ORGANIZATION_SCHEDULE)

| Event Name | Payload Type | Publisher | Consumer |
|-----------|-------------|---------|---------|
| `workspace:schedule:proposed` | `WorkspaceScheduleProposedPayload` | `workspace-core/_components/workspace-provider.tsx` | Event Funnel → `account-organization.schedule` |

### Organization Events (ORGANIZATION_EVENT_BUS)

| Event Name | Published By | Consumer |
|-----------|------------|---------|
| `organization:schedule:assigned` | `account-organization.schedule` | Event Funnel → `projection.account-schedule`; FCM Layer 2 (notification router) |
| `organization:schedule:assignRejected` | `account-organization.schedule` | Event Funnel |

### Workspace Events (WORKSPACE_EVENT_BUS)

| Event Name | Subscribed By |
|-----------|-------------|
| `workspace:issues:resolved` | `useScheduleEventHandler` in `workspace-business.schedule` |
| `workspace:tasks:scheduleRequested` | `useWorkspaceSchedule` (hint via `scheduleTaskRequest` AppState) |

---

## TypeScript Type Contracts

All types are strict — no `any`. The canonical definitions live in `@/shared/types` and within each slice's private files.

### `ScheduleItem` (shared)

```ts
// Defined in @/shared/types/schedule.types.ts
interface ScheduleItem {
  id: string;
  accountId: string;       // Owning organization ID
  workspaceId: string;
  title: string;
  status: ScheduleStatus;  // 'PROPOSAL' | 'OFFICIAL' | 'REJECTED'
  startDate: Timestamp;
  endDate: Timestamp;
  originType: 'MANUAL' | 'TASK_AUTOMATION';
  assigneeIds: string[];
  requiredSkills?: SkillRequirement[];
}
```

### `OrgScheduleProposal` (account-organization.schedule)

```ts
// Defined in account-organization.schedule/_schedule.ts
interface OrgScheduleProposal {
  scheduleItemId: string;
  workspaceId: string;
  orgId: string;
  title: string;
  startDate: string;   // ISO string — not Firestore Timestamp
  endDate: string;
  proposedBy: string;
  status: OrgScheduleStatus; // 'draft' | 'proposed' | 'confirmed' | 'cancelled'
  receivedAt: string;
  intentId?: string;               // SourcePointer — traceability to ParsingIntent
  skillRequirements?: SkillRequirement[];
}
```

### `AccountScheduleProjection` (projection.account-schedule)

```ts
// Defined in projection.account-schedule/_projector.ts
interface AccountScheduleProjection {
  accountId: string;
  activeAssignmentIds: string[];
  assignmentIndex: Record<string, AccountScheduleAssignment>;
  readModelVersion: number;
}

interface AccountScheduleAssignment {
  scheduleItemId: string;
  workspaceId: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
}
```

### `WorkspaceScheduleProposedPayload` (workspace-core.event-bus)

```ts
// Defined in workspace-core.event-bus/_events.ts
interface WorkspaceScheduleProposedPayload {
  scheduleItemId: string;
  workspaceId: string;
  orgId: string;
  title: string;
  startDate: string;
  endDate: string;
  proposedBy: string;
  intentId?: string;
  skillRequirements?: SkillRequirement[];
}
```

---

## App Router Route Map

The schedule domain uses both parallel routes and intercepting routes per `logic-overview.v3.md`.

| URL Pattern | Slot / Route Type | Component | Owning Slice |
|------------|------------------|-----------|-------------|
| `/dashboard/account/schedule` | Standard page | `AccountScheduleSection` | `workspace-business.schedule` |
| `/dashboard/account/org-schedule` | Standard page | `OrgScheduleGovernance` | `account-organization.schedule` |
| `/dashboard/workspaces/[id]/@businesstab/schedule` | Parallel route (`@businesstab`) | `WorkspaceSchedule` | `workspace-business.schedule` |
| `/dashboard/workspaces/[id]/schedule-proposal` | Canonical page | `ScheduleProposalContent` | `workspace-business.schedule` |
| `/dashboard/workspaces/[id]/@modal/(.)schedule-proposal` | Intercepting route in `@modal` | `ScheduleProposalContent` | `workspace-business.schedule` |
| `/dashboard/workspaces/[id]/governance` | Canonical page | `GovernanceSidebar` | `workspace-business.schedule` |
| `/dashboard/workspaces/[id]/@panel/(.)governance` | Intercepting route in `@panel` | `GovernanceSidebar` | `workspace-business.schedule` |

Route composition rule: layouts compose slots and shared chrome only — no business logic in layout files.

---

## Architecture Invariants for Schedule

These invariants from `logic-overview.v3.md` apply specifically to the schedule domain.

| # | Rule | Enforcement Point |
|---|------|------------------|
| 1 | Each BC modifies only its own aggregate | `workspace-business.schedule` writes `schedule_items`; `account-organization.schedule` writes `orgScheduleProposals` |
| 2 | Cross-BC reads only via Event/Projection | `useScheduleActions` reads `projection.account-schedule`, not Account aggregate |
| 12 | Tier is never stored in any DB field | `approveOrgScheduleProposal` calls `resolveSkillTier(xp)` — never reads a `tier` field from Firestore |
| 14 | Schedule reads only `projection.org-eligible-member-view` for member eligibility | Both `useScheduleActions` and `approveOrgScheduleProposal` use this projection |
| A5 | `ScheduleAssignRejected` is the compensating event for failed assignments | Only `approveOrgScheduleProposal` emits it — not `cancelOrgScheduleProposal` |

---

## Shared Library: `canTransitionScheduleStatus`

Schedule status transitions are enforced by a pure function in `@/shared/lib`:

```
PROPOSAL  →  OFFICIAL
PROPOSAL  →  REJECTED
OFFICIAL  →  REJECTED
REJECTED  →  PROPOSAL
```

Always call `canTransitionScheduleStatus(from, to)` before any status write. Throw if the transition is invalid.

---

## Adding New Schedule Features: Implementation Checklist

Before writing any code, confirm the feature belongs to one of the schedule slices.

1. **Identify the use case.** Does it belong to workspace-level scheduling (`workspace-business.schedule`) or org-level HR assignment (`account-organization.schedule`)?

2. **Place types correctly.**
   - Domain types shared across slices → `@/shared/types/schedule.types.ts`.
   - Feature-specific types → private `_types.ts` or inline in the owning file.
   - Never add schedule types to `@/shared/types` unless they are consumed by more than one slice.

3. **Write domain rules as pure functions.**
   - New transition or validation rules → `@/shared/lib/schedule.rules.ts`.
   - No async, no I/O, no React dependencies inside `shared/lib`.

4. **Add Firestore writes to the owning repository.**
   - Workspace schedule items → `@/shared/infra/firestore/repositories/schedule.repository.ts`.
   - Org schedule proposals → `account-organization.schedule/_schedule.ts` via `setDocument`/`updateDocument`.
   - Projection writes → `projection.account-schedule/_projector.ts` (called by Event Funnel only).

5. **Expose the action.**
   - Server-side mutations → `_actions.ts` in the owning slice.
   - Client-side React hooks → `_hooks/` in the owning slice.
   - Export through `index.ts` only — never import a `_` private file from outside the slice.

6. **Add or update the route.**
   - Static pages → standard `page.tsx`.
   - Modal overlays from list context → intercepting route in `@modal/(.)target/page.tsx` plus canonical `target/page.tsx`.
   - Slide-in panels → intercepting route in `@panel/(.)target/page.tsx` plus canonical `target/page.tsx`.
   - Keep layout files thin (composition only — no business logic).

7. **Wire new events.**
   - New workspace bus events → add to `WorkspaceEventPayloadMap` in `workspace-core.event-bus/_events.ts`.
   - New org bus events → add to the org event bus contracts.
   - Register new projection handlers in `projection.event-funnel/_funnel.ts`.

8. **Validate slice boundaries.**
   - Does any import cross a slice boundary without going through `index.ts`? Fix it.
   - Does any code read a Domain Aggregate directly from another BC? Replace with a Projection query.
   - Does any code store `tier` in Firestore? Remove it; compute at runtime with `resolveSkillTier(xp)`.

---

## Anti-Patterns

```ts
// Bad: import private file across slice boundary
import { approveOrgScheduleProposal } from '@/features/account-organization.schedule/_schedule';
// Good: use the public API
import { approveOrgScheduleProposal } from '@/features/account-organization.schedule';

// Bad: store tier in Firestore
await updateDocument(`orgScheduleProposals/${id}`, { tier: 'expert' });
// Good: compute at call site, store only xp
const tier = resolveSkillTier(memberView.skills[req.tagSlug].xp);

// Bad: read Account aggregate to check member skills in schedule domain
const account = await getAccount(memberId);
const xp = account.skills[skillId].xp;
// Good: read only the designated projection (Invariant #14)
const memberView = await getOrgMemberEligibility(orgId, memberId);
const xp = memberView.skills[req.tagSlug].xp;

// Bad: add schedule governance logic to workspace-governance.schedule (stub)
// workspace-governance.schedule/index.ts has no exports and must remain a stub.
// Good: all schedule business logic belongs in workspace-business.schedule

// Bad: B-track issues slice writes directly into schedule items to "recover"
await updateScheduleItemStatus(accountId, itemId, 'PROPOSAL'); // from issues slice
// Good: issues slice publishes IssueResolved event; schedule slice subscribes and acts itself

// Bad: skip availability check before assignment
await assignMemberAction(item.accountId, item.id, memberId);
// Good: check projection.account-schedule first (Invariant #14)
const active = await getAccountActiveAssignments(memberId);
const conflicting = active.some(a => a.workspaceId !== item.workspaceId);
if (conflicting) { /* reject with toast */ return; }
await assignMemberAction(item.accountId, item.id, memberId);
```

---

## Slice Boundary Validation Summary

Each slice in this domain passes the following boundary checks:

| Slice | Owns its Firestore writes | Cross-BC reads via Projection only | No `_` private imports from outside | Business flow is complete end-to-end |
|-------|--------------------------|-----------------------------------|------------------------------------|--------------------------------------|
| `workspace-business.schedule` | Yes | Yes (`projection.account-schedule`, `projection.org-eligible-member-view`) | Yes | Yes (UC-1, UC-4, UC-5, UC-6) |
| `account-organization.schedule` | Yes | Yes (`projection.org-eligible-member-view`) | Yes | Yes (UC-2, UC-3) |
| `workspace-governance.schedule` | No active code | No active code | Yes | Stub — reserved for future workspace governance rules |
| `projection.account-schedule` | Written by Event Funnel only | Yes (read-only from schedule slices) | Yes | Yes (UC-7) |

Each vertical slice here represents a **complete business flow**, not a technical layer split. `workspace-business.schedule` owns the full proposal → governance decision cycle. `account-organization.schedule` owns the full HR assignment → skill validation → event publish cycle. Neither slice delegates write responsibility to the other.
