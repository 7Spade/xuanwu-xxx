# Workspace Architecture Plan 2026

> **Status**: Analysis only — no code changes. Read alongside `docs/plan-app-to-rsc-and-parallel-routes.md`.

---

## 1. Current State Assessment (repomix scan)

### File inventory

```
src/app/dashboard/workspaces/
├─ page.tsx                         ← list page (client, useState + useEffect)
├─ _components/                     ← WorkspaceCard, GridView, TableView, filters
├─ _lib/                            ← useWorkspaceFilters, workspace-actions.ts
└─ [id]/
    ├─ layout.tsx                   ← WorkspaceProvider + WorkspaceLayoutInner (CLIENT)
    ├─ page.tsx                     ← renders WorkspaceTabs (client)
    ├─ _components/
    │   ├─ workspace-tabs.tsx       ← monolithic tab router (client, useSearchParams)
    │   ├─ workspace-settings.tsx   ← settings dialog (client)
    │   └─ workspace-status-bar.tsx ← status display (client)
    ├─ _events/
    │   ├─ workspace-events.ts      ← type definitions (pure TS) ✅
    │   ├─ workspace-event-bus.ts   ← Observer class (pure TS) ✅
    │   └─ workspace-event-handler.tsx ← global subscriber (client component)
    └─ capabilities/                ← 12 capability directories
        ├─ acceptance/              ← acceptance.tsx (client)
        ├─ audit/                   ← dual-view + hooks + components (client)
        ├─ capabilities/            ← workspace-capabilities.tsx (client)
        ├─ daily/                   ← dual-view + hooks + components (client)
        ├─ document-parser/         ← AI pipeline (client)
        ├─ files/                   ← files list (client)
        ├─ finance/                 ← finance dashboard (client)
        ├─ issues/                  ← issue tracker (client)
        ├─ members/                 ← member management (client)
        ├─ qa/                      ← QA workflow (client)
        ├─ schedule/                ← dual-view + hooks + components (client)
        └─ tasks/                   ← task board + logic + types (client)
```

### What already works well

| Pattern | Location | Assessment |
|---------|----------|------------|
| 4-layer capability model | `workspace-tabs.tsx:38-59` | ✅ Sound, keep |
| Typed event bus (Observer) | `_events/workspace-event-bus.ts` | ✅ Clean class, keep |
| Typed event contract | `_events/workspace-events.ts` | ✅ Discriminated union, keep |
| Dual-view naming | `{cap}.workspace.tsx` / `{cap}.account.tsx` | ✅ Consistent, keep |
| WorkspaceProvider at layout boundary | `[id]/layout.tsx` | ✅ Correct boundary |
| Capability barrel | `capabilities/index.ts` | ✅ Clean re-export |

### Current pain points

| Pain point | Root cause | Impact |
|------------|-----------|--------|
| All 12 capabilities loaded in one `<Tabs>` render | `workspace-tabs.tsx` imports all | Slow initial paint; no per-capability loading state |
| Tab state in URL search params `?tab=x` | Not route segments | Can't have per-tab `loading.tsx`, `error.tsx`, or nested parallel slots |
| No RSC boundary | Every component has `useState` | Full JS bundle sent for read-only capabilities (audit, files) |
| `WorkspaceEventHandler` mounts globally | Client component at layout level | Event subscriptions can't be lazy |
| Dialog state in capability components | `useState` co-located | No URL-addressable modals; no `@modal` slot |

---

## 2. Modern Patterns (context7 research)

### 2a. Next.js 16 Parallel Routes for Tabs

Instead of `?tab=tasks` (search params), each capability becomes a **route segment** inside an `@capability` slot:

```
[id]/
├─ layout.tsx                 ← receives @capability + @modal slots
├─ page.tsx                   ← default capability (redirects to /tasks)
├─ @capability/               ← parallel slot
│   ├─ default.tsx            ← null (no capability selected)
│   ├─ tasks/
│   │   ├─ page.tsx           ← WorkspaceTasks (RSC shell + client subtree)
│   │   └─ loading.tsx
│   ├─ daily/
│   │   ├─ page.tsx
│   │   └─ loading.tsx
│   ├─ schedule/
│   │   └─ page.tsx
│   └─ ... (one dir per capability)
└─ @modal/                    ← parallel slot for overlay dialogs
    ├─ default.tsx            ← null
    └─ (.)daily-log/[id]/
        └─ page.tsx           ← DailyLogDialog as intercepted route
```

**Key benefits of `@capability` slot:**
- Independent `loading.tsx` per capability — skeleton only for the active tab
- Independent `error.tsx` per capability — one crash doesn't affect others
- URL is now `/workspace/[id]/tasks` not `/workspace/[id]?tab=tasks` → bookmarkable, shareable
- `useSelectedLayoutSegment('capability')` replaces `useSearchParams()` for active tab highlight
- Lazy hydration: inactive capability pages are never loaded in the client bundle

### 2b. `useSelectedLayoutSegment` for Active Tab

```tsx
// [id]/layout.tsx (Server Component)
import { useSelectedLayoutSegment } from 'next/navigation'

export default function WorkspaceLayout({
  children,
  capability,
  modal,
  params,
}: {
  children: React.ReactNode
  capability: React.ReactNode  // @capability slot
  modal: React.ReactNode       // @modal slot
  params: { id: string }
}) {
  return (
    <WorkspaceProvider workspaceId={params.id}>
      <WorkspaceNavTabs />    {/* client island for tab highlights */}
      {capability}            {/* renders the active capability route */}
      {modal}                 {/* renders @modal slot when active */}
    </WorkspaceProvider>
  )
}
```

```tsx
// WorkspaceNavTabs (client island — only tab bar, not the content)
'use client'
import { useSelectedLayoutSegment } from 'next/navigation'

export function WorkspaceNavTabs() {
  const activeSegment = useSelectedLayoutSegment('capability')
  // render tab buttons with active state
}
```

### 2c. Intercepting Routes for Dialogs

Replace `useState` dialog opens with intercepting routes:

```
[id]/
└─ @modal/
    └─ (.)daily-log/[id]/
        └─ page.tsx   ← renders DailyLogDialog inside modal shell
```

When navigating to `/workspace/[id]/daily-log/abc`:
- **Client navigation** → intercepted → shows modal overlay at current URL
- **Hard refresh / direct URL** → non-intercepted → shows full-page daily log detail
- **Back button** → closes modal, returns to previous capability

### 2d. RSC Boundaries per Capability

| Capability | Can be RSC? | Why |
|------------|------------|-----|
| `audit` | ✅ Yes (mostly) | Read-only log stream; selection state = small client island |
| `files` | ✅ Yes | Read list + download links; upload = client island |
| `members` | ✅ Yes | Read list; role change = client island |
| `capabilities` | ✅ Yes | Config read; mount/unmount = Server Action |
| `schedule` | ⚠️ Partial | Calendar navigation is client; proposal dialog is client |
| `daily` | ⚠️ Partial | Feed is RSC; composer + upload is client island |
| `tasks` | ❌ Client | Drag-and-drop board; rich interaction |
| `qa` | ❌ Client | Approval workflow with toast/confirm |
| `acceptance` | ❌ Client | Status transitions |
| `issues` | ⚠️ Partial | List is RSC; create dialog is client island |
| `finance` | ✅ Yes | Display only |
| `document-parser` | ❌ Client | AI streaming response |

**Pattern for partial RSC (e.g., daily):**
```tsx
// @capability/daily/page.tsx — Server Component
import { getDailyLogs } from '@/server-commands/daily'
import { DailyFeed } from '@/features/daily/ui/daily-feed'     // RSC
import { DailyComposerIsland } from '@/features/daily/ui/composer-island' // 'use client'

export default async function DailyCapabilityPage({ params }) {
  const logs = await getDailyLogs(params.id)
  return (
    <>
      <DailyComposerIsland />   {/* client island — hydrated */}
      <DailyFeed logs={logs} />  {/* RSC — no hydration */}
    </>
  )
}
```

---

## 3. One Core, Two Views — Modern Pattern

The current `{cap}.workspace.tsx` / `{cap}.account.tsx` naming is good. The modern enhancement is to make the **data layer** explicit in `src/features/{domain}`:

```
src/features/
└─ schedule/
    ├─ index.ts                ← orchestration (approveScheduleItem, rejectScheduleItem)
    ├─ workspace-view.ts       ← data fetching for workspace-scoped view
    ├─ account-view.ts         ← data fetching for account-scoped aggregation
    └─ types.ts                ← ScheduleViewData, AccountScheduleData
```

**Workspace view** = proposer perspective: create/edit/propose
**Account view** = governor perspective: review/approve/reject across all workspaces

```tsx
// @capability/schedule/page.tsx — workspace view (Server Component)
import { getWorkspaceScheduleView } from '@/features/schedule/workspace-view'
import { WorkspaceSchedule } from '@/features/schedule/ui/workspace-schedule'

export default async function ScheduleCapabilityPage({ params }) {
  const data = await getWorkspaceScheduleView(params.id)
  return <WorkspaceSchedule data={data} workspaceId={params.id} />
}
```

```tsx
// app/dashboard/account/schedule/page.tsx — account view (Server Component)
import { getAccountScheduleView } from '@/features/schedule/account-view'
import { AccountScheduleComponent } from '@/features/schedule/ui/account-schedule'

export default async function AccountSchedulePage() {
  const data = await getAccountScheduleView()
  return <AccountScheduleComponent data={data} />
}
```

---

## 4. Event Bus: Keep vs Evolve

### Current: Class-based Observer (WorkspaceEventBus)

```
WorkspaceEventBus (class)
  .subscribe(eventName, handler) → unsubscribeFn
  .publish(eventName, payload)
```

**Assessment: ✅ Keep as-is.** The typed class is clean, zero dependencies, and correct for same-process cross-capability communication. No framework change needed.

**What to evolve:**
- Move `WorkspaceEventBus` instantiation from layout into `WorkspaceContext` (already done)
- Move `WorkspaceEventHandler` component into `features/{domain}` as a hook
- Add a `WorkspaceEventBusProvider` that exposes `publish`/`subscribe` via context to avoid prop drilling

### Alternative: React Context as Event Bus

For teams preferring zero classes:

```tsx
// shared/context/workspace-event-context.tsx
const WorkspaceEventContext = createContext<{
  publish: PublishFn
  subscribe: SubscribeFn
} | null>(null)

export function WorkspaceEventProvider({ children }: { children: ReactNode }) {
  const bus = useMemo(() => new WorkspaceEventBus(), [])
  return (
    <WorkspaceEventContext.Provider value={bus}>
      {children}
    </WorkspaceEventContext.Provider>
  )
}
```

This makes the existing `WorkspaceEventBus` class accessible as a React hook, bridging the two worlds without replacing either.

---

## 5. Target Architecture: "Workspace as a Feature Container"

### Dependency direction

```
app/dashboard/workspaces/[id]/
  @capability/{cap}/page.tsx          (RSC boundary — thin, delegates to features)
  @modal/...                          (intercepting routes — delegates to features)
  layout.tsx                          (provides WorkspaceProvider + slots)
          ↓
src/features/{domain}/
  workspace-view.ts                   (data fetching for workspace-scoped view)
  account-view.ts                     (data fetching for account-scoped aggregation)
  ui/workspace-{cap}.tsx              (view component — RSC or client island)
  ui/account-{cap}.tsx                (view component — aggregated RSC)
          ↓
src/actions/{domain}/index.ts         (server boundary — write operations)
          ↓
src/entities/{domain}/index.ts        (pure business rules — permission, state transition)
          ↓
src/infra/firebase/...                (Firestore/Storage reads + writes)
```

### Target directory layout

```
src/app/dashboard/workspaces/
├─ page.tsx                           ← RSC: fetches workspace list
├─ _components/                       ← WorkspaceCard (RSC), GridView (RSC)
└─ [id]/
    ├─ layout.tsx                     ← SERVER: provides WorkspaceProvider shell
    ├─ page.tsx                       ← redirect to default capability
    ├─ @capability/
    │   ├─ default.tsx                ← null
    │   ├─ tasks/page.tsx             ← delegates to features/tasks/ui/
    │   ├─ daily/page.tsx             ← RSC + client island from features/daily/ui/
    │   ├─ schedule/page.tsx          ← partial RSC from features/schedule/ui/
    │   ├─ audit/page.tsx             ← RSC from features/audit/ui/
    │   ├─ files/page.tsx             ← RSC from features/files/ui/
    │   ├─ members/page.tsx           ← RSC from features/members/ui/
    │   ├─ capabilities/page.tsx      ← RSC from features/workspace-config/ui/
    │   ├─ issues/page.tsx            ← RSC + client island
    │   ├─ qa/page.tsx                ← client
    │   ├─ acceptance/page.tsx        ← client
    │   ├─ finance/page.tsx           ← RSC
    │   └─ document-parser/page.tsx   ← client (AI streaming)
    ├─ @modal/
    │   ├─ default.tsx                ← null
    │   └─ (.)daily-log/[id]/page.tsx ← intercepting: DailyLogDialog
    ├─ @panel/                        ← optional: governance sidebar for schedule
    │   └─ default.tsx                ← null
    └─ _events/                       ← KEEP AS-IS (pure TS)
        ├─ workspace-events.ts
        ├─ workspace-event-bus.ts
        └─ workspace-event-handler.tsx (evolve → use hook from features/)
```

---

## 6. Migration Priority (Recommended Order)

Follow the same "one domain at a time" rule from `src/entities/GEMINI.md` §IV.

### Wave 1 — Structural (no behavior change)

| Step | Change | Risk |
|------|--------|------|
| 1a | Create `[id]/@capability/` slot; move `page.tsx` → `@capability/tasks/page.tsx`; add `default.tsx` | Medium — routing change |
| 1b | Replace `workspace-tabs.tsx` search-params with `useSelectedLayoutSegment('capability')` tab bar | Low — client-only |
| 1c | Add `[id]/@modal/` slot + `default.tsx` | Low — additive |

### Wave 2 — RSC boundaries for read-heavy capabilities

| Capability | Move to | Server data source |
|------------|---------|-------------------|
| `audit` | `features/audit/ui/` | `actions/audit/getAuditLogs` |
| `files` | `features/files/ui/` | `actions/workspace/getFiles` |
| `members` | `features/members/ui/` | `actions/workspace/getMembers` |
| `finance` | `features/finance/ui/` | `actions/workspace/getFinance` |

### Wave 3 — Partial RSC for daily + schedule

| Step | Change |
|------|--------|
| 3a | Extract `DailyFeed` (RSC) from `daily.workspace.tsx`; keep `DailyComposerIsland` client |
| 3b | Extract `ScheduleCalendar` (client island) from `schedule.workspace.tsx`; make data fetching RSC |
| 3c | Move `DailyLogDialog` → `@modal/(.)daily-log/[id]/` intercepting route |
| 3d | Move `ProposalDialog` → `@modal/(.)schedule-proposal/` intercepting route |

### Wave 4 — Event bus refinement

| Step | Change |
|------|--------|
| 4a | Wrap `WorkspaceEventBus` in `WorkspaceEventProvider` (context) |
| 4b | Replace `WorkspaceEventHandler` component with `useWorkspaceEvents` hook in `features/workspace/` |
| 4c | Add `@panel/@governance` slot for `GovernanceSidebar` (schedule) |

---

## 7. What NOT to Change

| Item | Reason to keep |
|------|---------------|
| `WorkspaceEventBus` class | Clean, typed, zero deps — no rewrite needed |
| `workspace-events.ts` type definitions | Already a pure TS contract ✅ |
| 4-layer capability model (Core/Governance/Business/Projection) | Conceptually sound for long-term governance |
| `WorkspaceProvider` / `WorkspaceContext` at `[id]/layout.tsx` | Correct RSC/client boundary placement |
| Dual-view naming (`{cap}.workspace.tsx` / `{cap}.account.tsx`) | Consistent, readable — just move into `features/` |
| `capabilities/index.ts` barrel | Useful — update paths only |
| `useWorkspaceFilters` in `_lib/` | Pure filter hook — stays in `_lib/` |

---

## 8. Summary

| Dimension | Current | Target |
|-----------|---------|--------|
| Tab routing | `?tab=x` search params | `@capability/{cap}/page.tsx` parallel routes |
| Dialog routing | `useState` in component | `@modal/(.)dialog-name` intercepting routes |
| Rendering | All capabilities = client | Audit/files/members/finance = RSC; interactive = client islands |
| Event bus | Class-based Observer | Keep class, wrap in `WorkspaceEventProvider` context |
| One core, two views | `{cap}.workspace.tsx` + `{cap}.account.tsx` colocated | Same names, moved into `features/{domain}/ui/` |
| Data fetching | `useWorkspace` hook (Firebase real-time) | RSC via `actions/{domain}` for static data; `useWorkspace` only for real-time |
| Active tab detection | `useSearchParams()` | `useSelectedLayoutSegment('capability')` |

The 4-layer model (Core → Governance → Business → Projection) remains valid and maps directly onto the capability registry. The modern enhancement is making each capability an **independent route segment** rather than a tab rendered in a monolithic client component.
