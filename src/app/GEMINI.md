# Project: Application Entry Layer (`src/app`)

## Role

Root of the Next.js App Router. Contains **only** routes, layouts, parallel-route slots, and route-specific files. Assembles UI from `features/` and `lib/`; never owns business logic or shared utilities.

---

## Rules

### 1. Only Route / Layout / Page / Parallel Route Slot

- Every route group maps to a folder.
- Allowed files: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `default.tsx`.
- Parallel-route slots use the `@slotName/` naming convention (`@capability/`, `@modal/`, `@panel/`).

### 2. Server / Client Component Split is Explicit

- Server Component is the **default** — no `"use client"` directive.
- Client Component requires explicit `"use client"` at the top of the file.
- Never mix server-only APIs (`cookies`, `headers`, `redirect`) with client-only APIs (`useState`, `useEffect`) in the same file.

### 3. No Business Logic

- Route files only **assemble** UI and call server actions / use-cases.
- Do **not** put domain rules, calculations, or multi-step orchestrations directly in route files.
- Domain logic belongs in `features/` (orchestration) or `entities/` (pure functions).

### 4. No General-Purpose Utilities or Functions

- Shared code belongs in `lib/` or `features/`.
- Route folders depend only on injected props or server actions, never on self-contained utility functions defined inline.

### 5. Parallel Route Conventions

- Each `@slot` is a self-contained UI region with its own `page.tsx` (and optionally `loading.tsx` / `error.tsx` / `default.tsx`).
- Slots **must not** share mutable state with each other directly.
- Slots consume data only via props or context — never by importing from sibling slots.
- Active slot detection: use `useSelectedLayoutSegment('slotName')` inside Client Components, not `usePathname`.

### 6. Streaming / Suspense Required for Async UI

- Every async data fetch must be wrapped in `<Suspense>` or an async Server Component.
- Do **not** use a single global loading state for the whole page.
- Route-level `loading.tsx` handles initial navigation; local `<Suspense>` handles sub-region latency.

### 7. Clear Boundaries — Only Depend on `features/` and `lib/` Interfaces

- Route files import from `features/` (view components, orchestration) and `lib/` (pure utilities).
- Do **not** import directly from `infra/` or `context/` inside route page files — go through actions or hooks.
- No cross-route-group global side effects.

### 8. Writes and External Integration via Server Actions / Route Handlers Only

- Mutations and external API calls are done through `src/actions/` or `app/api/` route handlers.
- Route components **never** write directly to the database or call Firebase SDK directly.

### 9. Route Groups are Self-Contained and Deletable

- Any route group (e.g., `(auth)/`, `dashboard/workspaces/[id]/`) can be removed or replaced without touching `features/`, `lib/`, `context/`, or `hooks/`.
- Route files may not introduce state or logic that bleeds into the domain / application layer.

---

## Dependency Rules

### Allowed Imports

```ts
import ... from "@/use-cases/..."   // ✅ view components, orchestration
import ... from "@/lib/..."         // ✅ pure utilities, event-bus
import ... from "@/server-commands/..."     // ✅ server actions (mutations + reads)
import ... from "@/react-hooks/..."       // ✅ client-side hooks
import ... from "@/react-providers/..."     // ✅ React context providers
import ... from "@/shared/ui/..."   // ✅ shadcn components
import ... from "@/domain-types/..."       // ✅ type definitions
```

### Disallowed Imports (from other layers into `src/app`)

```ts
// No other layer may import from src/app — it creates circular dependencies.
// app/ is the top layer; nothing depends on it.
```

---

## Who Depends on This Layer?

**No one.** `types/`, `lib/`, `infra/`, `hooks/`, `context/`, `features/`, `components/`, `ai/` must never import from `src/app/`.
