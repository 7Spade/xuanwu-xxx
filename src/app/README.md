# `src/app/` — Application Entry Layer (Next.js App Router)

Pages, layouts, parallel-route slots, and route-specific files. The **top-most** layer — assembles UI from `features/` and `lib/`, never owns business logic.

---

## Rules

### 1. Only Route / Layout / Page / Parallel Route Slot

Every route group corresponds to a folder. Only these files belong directly in route folders:

| File | Purpose |
|------|---------|
| `layout.tsx` | Layout shell, slot composition |
| `page.tsx` | Route entry point (thin wrapper) |
| `loading.tsx` | Suspense skeleton (use shadcn `<Skeleton>`) |
| `error.tsx` | Error boundary (use shadcn `<Button>` + lucide icon) |
| `default.tsx` | Parallel-slot inactive default |

Parallel-route slots use the `@slotName/` convention: `@capability/`, `@modal/`, `@panel/`.

### 2. Server / Client Components — Explicit Split

- **Server Component** is the default (no directive needed).
- **Client Component** requires `"use client"` at the top.
- Never mix server-only (`cookies`, `headers`, `redirect`) and client-only (`useState`, `useEffect`) in the same file.

### 3. No Business Logic in Route Files

Route files only **assemble** UI and call server actions. They do not:
- Define domain rules or calculations
- Orchestrate multi-step operations
- Validate domain invariants

→ Domain logic: `features/` (orchestration) or `entities/` (pure functions).

### 4. No General-Purpose Utilities

Route folders depend only on injected props and server actions.

```ts
// ❌ Don't do this in a route file
function formatDate(d: Date) { ... }

// ✅ Import from lib/
import { formatDate } from "@/lib/utils"
```

Shared utilities live in `lib/` or `features/`.

### 5. Parallel Route Conventions

- Each `@slot` is **self-contained**: its own `page.tsx`, optionally `loading.tsx` / `error.tsx` / `default.tsx`.
- Slots **must not** share mutable state with sibling slots.
- Slots consume data via props or context — never by importing from a sibling slot.
- Use `useSelectedLayoutSegment('slotName')` (not `usePathname`) for active-state detection.

```tsx
// ✅ Correct active-tab detection in workspace nav
const active = useSelectedLayoutSegment("capability")
```

### 6. Streaming / Suspense for All Async UI

Every async data fetch must be wrapped in `<Suspense>` or be an async Server Component.

```tsx
// ✅ Per-region suspense
<Suspense fallback={<AuditSkeleton />}>
  <AuditFeed workspaceId={id} />
</Suspense>
```

- Route-level `loading.tsx` handles initial navigation.
- Local `<Suspense>` handles sub-region latency independently.
- Do **not** use a single global loading state for the whole page.

### 7. Clear Boundaries — Depend Only on `features/` and `lib/`

```ts
// ✅ Correct
import { AuditView } from "@/features/audit/audit-view"
import { getAuditLogs } from "@/actions/audit"

// ❌ Never import infra directly from a route page
import { firestoreFacade } from "@/infra/firebase/firestore/firestore.facade"
```

No cross-route-group global side effects.

### 8. Writes and External Integration — Server Actions / Route Handlers Only

```ts
// ✅ Correct
import { createWorkspace } from "@/actions/workspace"

// ❌ Never call Firebase SDK directly from a route component
import { db } from "@/infra/firebase/firestore/db"
```

Mutations and external API calls go through `src/actions/` or `app/api/` route handlers.

### 9. Route Groups are Self-Contained and Replaceable

Any route group (e.g., `(auth)/`, `dashboard/workspaces/[id]/`) can be:
- Removed without touching `features/`, `lib/`, `context/`, or `hooks/`
- Replaced with a completely different UI without modifying the domain layer

Route files must not introduce state or logic that bleeds into the domain / application layer.

---

## What Belongs Here

```
src/app/
├── (auth)/                  # Route group (no URL segment)
│   └── login/
│       └── page.tsx         # 4-line RSC wrapper → features/auth/login-view.tsx
├── dashboard/
│   ├── layout.tsx           # Dashboard shell
│   ├── workspaces/
│   │   └── [id]/
│   │       ├── layout.tsx           # Slot compositor
│   │       ├── @capability/         # Parallel slot — workspace tabs
│   │       │   └── tasks/
│   │       │       ├── page.tsx
│   │       │       ├── loading.tsx  # shadcn Skeleton
│   │       │       └── error.tsx    # shadcn Button + AlertCircle
│   │       ├── @modal/              # Parallel slot — dialogs
│   │       │   └── (.)daily-log/
│   │       │       └── [logId]/
│   │       │           └── page.tsx # Intercepting route
│   │       └── @panel/              # Parallel slot — audit / governance
│   │           └── default.tsx
│   └── account/
│       └── members/
│           └── page.tsx     # Thin RSC wrapper → features/members/members-view.tsx
└── api/                     # Route Handlers (writes / external integrations)
```

## What Does NOT Belong Here

| Concern | Correct location |
|---------|-----------------|
| Reusable UI components | `src/shared/ui/` or `src/features/*/` |
| Business / domain logic | `src/features/` or `src/entities/` |
| Global state | `src/context/` |
| Server-side reads/writes | `src/actions/` |
| Pure utilities | `src/lib/` |
| Real-time Firebase listeners | `src/hooks/` |

---

## Allowed Imports

```ts
import ... from "@/features/..."   // ✅ view components, orchestration
import ... from "@/lib/..."         // ✅ pure utilities, event-bus
import ... from "@/actions/..."     // ✅ server actions (mutations + reads)
import ... from "@/hooks/..."       // ✅ client-side hooks
import ... from "@/context/..."     // ✅ React context providers
import ... from "@/shared/ui/..."   // ✅ shadcn components
import ... from "@/types/..."       // ✅ type definitions
```

## Forbidden

```ts
// No other layer may import from src/app — circular dependency.
// app/ is the top layer; nothing below it depends on it.
```
