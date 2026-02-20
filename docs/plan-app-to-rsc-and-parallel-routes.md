# Plan: `src/app` → Pure Route Tree + RSC Boundary

**Status:** Analysis only — no code changes yet  
**Sources:** Next.js 16 docs (context7), repomix codebase scan  
**Scope:** `src/app`, `src/features` migration strategy, parallel routes priority

---

## 1. Current State Diagnosis

### Problem

Every `page.tsx` and `_component/*.tsx` in `src/app` is a full **client component** — they use `useState`, `useEffect`, custom hooks, and call actions directly. No page uses `async function Page()` with `await` for data fetching (RSC pattern). Examples:

| File | Lines | Problem |
|------|-------|---------|
| `account/members/page.tsx` | ~200 | `useState` + mutations in page |
| `account/partners/page.tsx` | ~200 | Full business logic in page |
| `account/teams/page.tsx` | ~150 | `useState` + mutations in page |
| `account/teams/[id]/page.tsx` | ~180 | `useState` + mutations in page |
| `account/partners/[id]/page.tsx` | ~250 | `useState` + mutations in page |
| `(auth)/login/page.tsx` | ~120 | All state management in page |
| `workspaces/[id]/page.tsx` | shell | ok but layout owns client state |

### Target State

```
src/app/                     ← Pure Route Tree + RSC boundary only
  page.tsx                   ← async RSC: <Suspense><Feature /></Suspense>
  layout.tsx                 ← RSC shell with slot props (@modal, @panel)
  @modal/                    ← Parallel slot for all dialogs
  @panel/                    ← Parallel slot for side panels
  loading.tsx                ← Route-level Suspense fallback
  error.tsx                  ← Route-level error boundary

src/features/{domain}/       ← All business UI and logic
  {page}-view.tsx            ← "use client" — state + mutations
  {page}-loader.tsx          ← RSC — fetches data, passes to view
  {page}-skeleton.tsx        ← Loading fallback
  index.ts                   ← barrel export
```

---

## 2. Next.js 16 Parallel Routes — Key Concepts

From the official docs:

- **`@slot` naming convention** — a folder named `@auth` becomes a `auth` prop in the parent layout
- **`default.tsx`** — must exist in each slot to render `null` when inactive (prevents crash on hard reload)
- **Intercepting routes** — `(.)login` intercepts `/login` within the same segment; renders as modal on client-nav, as full page on hard reload
- **Deep-linkable modals** — URL changes to the modal route, so refresh keeps the modal open
- **Independent loading** — each slot can have its own `loading.tsx` and `error.tsx`

---

## 3. Parallel Routes Priority

### Priority 1 — MUST migrate (high impact, clear ROI)

#### A. `dashboard/workspaces/[id]/@capability` — Capability Tabs

**Current:** `workspace-tabs.tsx` renders 12+ capabilities as `<TabsContent>` inside a single Tabs component. All capabilities load eagerly when the workspace page loads.

**Target:**
```
app/dashboard/workspaces/[id]/
  layout.tsx              ← receives @capability prop
  page.tsx                ← workspace shell (RSC)
  @capability/
    default.tsx           ← null (inactive default)
    tasks/page.tsx        ← /workspaces/[id]/tasks
    daily/page.tsx        ← /workspaces/[id]/daily
    schedule/page.tsx     ← /workspaces/[id]/schedule
    members/page.tsx      ← /workspaces/[id]/members
    audit/page.tsx        ← /workspaces/[id]/audit
    files/page.tsx        ← /workspaces/[id]/files
    issues/page.tsx       ← /workspaces/[id]/issues
    qa/page.tsx           ← /workspaces/[id]/qa
    acceptance/page.tsx   ← /workspaces/[id]/acceptance
    capabilities/page.tsx ← /workspaces/[id]/capabilities
```

**Benefits:**
- Each capability gets its own `loading.tsx` skeleton
- URL becomes the tab state (`/workspaces/abc/schedule` is shareable)
- Capabilities load independently (streaming)
- `workspace-tabs.tsx` becomes a simple nav with `<Link>` instead of tab content

**Replaces:** `useSearchParams` tab state, tab rendering logic in `workspace-tabs.tsx`

---

#### B. `dashboard/@modal` — All Dialogs as Routes

**Current:** 8+ Dialog/Sheet components rendered conditionally via `open={boolean}` state. Not deep-linkable. URLs do not change.

**Dialogs to migrate:**

| Dialog | New Route |
|--------|-----------|
| `workspace-settings.tsx` | `dashboard/workspaces/[id]/@modal/(.)settings` |
| `create-workspace-dialog.tsx` | `dashboard/workspaces/@modal/(.)new` |
| `account-create-dialog.tsx` | `dashboard/@modal/(.)account/new` |
| `daily-log-dialog.tsx` | `dashboard/workspaces/[id]/daily/@modal/(.)log/[logId]` |
| `proposal-dialog.tsx` (schedule) | `dashboard/workspaces/[id]/schedule/@modal/(.)propose` |
| `reset-password-dialog.tsx` | `(auth)/@modal/(.)reset-password` |
| `user-settings-overlay.tsx` | `dashboard/@modal/(.)settings` |

**Benefits:**
- Browser back button closes modal (native behavior)
- Shareable URLs for specific records
- Modal opens as overlay on client-nav, full page on direct URL

---

### Priority 2 — Should migrate (medium complexity)

#### C. `dashboard/@panel` — Audit Detail Side Panel

**Current:** `audit-detail-sheet.tsx` is a Sheet (side panel) opened via `open={boolean}` state.

**Target:**
```
dashboard/workspaces/[id]/audit/@panel/(.)log/[logId]/page.tsx
```

Same pattern as @modal but for side panels. Allows direct URL to a specific audit log.

---

#### D. `dashboard/workspaces/@list` + `[id]` split view (optional)

For a future desktop split-view where the workspace list stays visible while a workspace detail is open in the main area. Low priority.

---

### Priority 3 — Nice to have (low complexity, minor gain)

#### E. `dashboard/@search` — Global Search Command

Currently triggered by keyboard shortcut, renders `CommandDialog` as a floating overlay. Could become `dashboard/@modal/(.)search` to make the search result deep-linkable.

---

## 4. `src/features` Migration Plan

### Principle: "Thin page, thick feature"

A page becomes:

```tsx
// app/dashboard/account/members/page.tsx — AFTER
import { Suspense } from 'react'
import { MembersLoader } from '@/features/members'
import { MembersSkeleton } from '@/features/members'

export default async function MembersPage() {
  return (
    <Suspense fallback={<MembersSkeleton />}>
      <MembersLoader />
    </Suspense>
  )
}
```

And the feature module does the work:

```tsx
// features/members/members-loader.tsx — RSC
import { getMembers } from '@/server-commands/account'
import { MembersView } from './members-view'

export async function MembersLoader() {
  const members = await getMembers()           // direct action call, no hook
  return <MembersView initialMembers={members} />
}

// features/members/members-view.tsx — Client Component
"use client"
export function MembersView({ initialMembers }) {
  const [members, setMembers] = useState(initialMembers)
  // ... all current page logic here
}
```

---

### Migration Priority by Domain

#### Wave 1 — Account pages (self-contained, no cross-domain deps)

| Page | Feature module |
|------|----------------|
| `account/members/page.tsx` | `features/members/` |
| `account/teams/page.tsx` | (merge into `features/account/`) |
| `account/teams/[id]/page.tsx` | `features/account/team-detail/` |
| `account/partners/page.tsx` | `features/partners/` |
| `account/partners/[id]/page.tsx` | `features/partners/partner-detail/` |
| `account/settings/page.tsx` | `features/user-settings/` |

**Why first:** These are isolated pages that only read from `useApp` + `useAccountManagement`. Easy to extract, no event bus dependency.

#### Wave 2 — Workspace capability pages

| Capability | Feature module |
|-----------|----------------|
| `capabilities/tasks/` | `features/tasks/` |
| `capabilities/issues/` | `features/issues/` |
| `capabilities/members/` | `features/workspace-members/` |
| `capabilities/files/` | `features/files/` |
| `capabilities/daily/` | `features/daily/` (partially exists) |
| `capabilities/schedule/` | `features/schedule/` (partially exists) |
| `capabilities/audit/` | `features/audit/` |

**Why second:** These have event bus subscribers and cross-capability deps. Must resolve `WorkspaceEventHandler` first.

#### Wave 3 — Auth

| Page | Feature module |
|------|----------------|
| `(auth)/login/page.tsx` | `features/auth/` (partially exists) |

**Current state:** `login/page.tsx` already calls `completeRegistration` from `features/auth`. Needs auth state (`handleAuth`, `handleAnonymous`) moved into `features/auth/login-view.tsx`.

#### Wave 4 — Dashboard overview

| Page | Feature module |
|------|----------------|
| `dashboard/page.tsx` | `features/dashboard/` |
| `dashboard/_components/settings/` | `features/user-settings/` |

**Why last:** These depend on many hooks and have the most cross-cutting state.

---

## 5. `src/app` Target File Count

After all migrations, `src/app` should contain **only**:

```
app/
  layout.tsx              ← Providers + @modal slot
  page.tsx                ← Redirect to /dashboard (RSC, 5 lines)
  (auth)/
    login/
      page.tsx            ← <Suspense><LoginView /></Suspense>  (10 lines)
  dashboard/
    layout.tsx            ← Sidebar + ThemeAdapter + @modal slot
    page.tsx              ← Overview RSC (20 lines)
    @modal/
      default.tsx
      (.)settings/page.tsx
      (.)account/new/page.tsx
    account/
      members/page.tsx    ← <Suspense><MembersLoader /></Suspense>
      teams/page.tsx      ← (same pattern)
      ... (one RSC wrapper per route, ~10 lines each)
    workspaces/
      page.tsx            ← <Suspense><WorkspaceListLoader /></Suspense>
      @modal/
        default.tsx
        (.)new/page.tsx
      [id]/
        layout.tsx        ← @capability slot
        page.tsx          ← workspace shell RSC
        @capability/
          default.tsx
          tasks/page.tsx
          daily/page.tsx
          ... (one RSC per capability)
        @modal/
          default.tsx
          (.)settings/page.tsx
```

**Target: ~50 files in `src/app` (down from 104), each file < 30 lines**

---

## 6. Implementation Order (following GEMINI.md rules)

```
Step 1: Add "use server" to all src/actions/{domain}/index.ts     ← already in GEMINI.md rules
Step 2: Wave 1 — account/* pages → features/                     ← no event bus needed
Step 3: Convert account/* page.tsx to RSC wrappers               ← thin pages
Step 4: Wave 2 — capability pages → features/ (no event bus)     ← tasks, issues, files
Step 5: Add @capability parallel route to workspaces/[id]         ← replaces workspace-tabs
Step 6: Wave 2b — daily, schedule, audit → features/             ← event bus consumers
Step 7: Add @modal parallel routes for all dialogs               ← deep-linkable modals
Step 8: Wave 3 — auth/login → features/                          ← completes auth feature
Step 9: Wave 4 — dashboard overview → features/                  ← final pass
Step 10: Add @panel for audit detail sheet                        ← nice-to-have
```

**Rule (from entities/GEMINI.md):** Do not refactor multiple layers simultaneously.  
Each step must pass `npm run typecheck` before the next step begins.

---

## 7. What Stays in `src/app` Forever

- `layout.tsx` files — slot composition only (`@modal`, `@capability`, provider wrapping)
- `page.tsx` files — RSC entry points with `<Suspense>` + `<FeatureLoader>` only
- `loading.tsx` — route-level Suspense fallbacks
- `error.tsx` — route-level error boundaries
- `default.tsx` — parallel slot inactive states (return null)
- `not-found.tsx` — 404 handlers

**Nothing with `useState`, `useEffect`, or custom hook calls belongs in `src/app`.**
