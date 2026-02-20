# `src/app/` — Application Entry Layer (Next.js App Router)

Pages, layouts, and route-specific components. The **top-most** layer.

## What belongs here

- `page.tsx` / `layout.tsx` — Route entry points
- `_components/` — Components used only within this route subtree
- `_hooks/` — Hooks used only within this route subtree
- Route groups: `(auth)/`, `(dashboard)/`, etc.

## What does NOT belong here

- Shared, reusable UI → `src/components/` (if it exists) or a shared `_components/`
- Business logic → `src/actions/` or `src/hooks/`
- Global state → `src/context/`

## Styling

Global CSS lives in `src/app/globals.css`. Use Tailwind utility classes.  
Do **not** hardcode color values — use theme variables (`bg-primary`, `text-destructive`, etc.).

## Allowed imports

Everything. This is the top layer.

```ts
import ... from '@/types/...'      // ✅
import ... from '@/lib/...'        // ✅
import ... from '@/infra/...'      // ✅ (prefer going via actions/hooks)
import ... from '@/actions/...'    // ✅
import ... from '@/hooks/...'      // ✅
import ... from '@/context/...'    // ✅
import ... from '@/ai/...'         // ✅ (Server Components / Server Actions only)
```

## Forbidden imports

```ts
// No other layer may import from src/app — it would create a circular dependency.
```
