---
applyTo: '**/*.tsx, **/*.ts'
description: 'Guide AI to generate modern Next.js App Router code with parallel routes, intercepting routes, streaming, and behavior-safe architecture.'
---

# Next.js Parallel Routes + Modern Architecture Instructions

## Goal

When implementing new features, AI should default to modern Next.js App Router patterns and produce maintainable code that supports:

1. parallel routes (`@slot`),
2. intercepting routes (`(.)`, `(..)`),
3. Server Component first design,
4. streaming with `Suspense` and route `loading.tsx`,
5. clear boundary layering (`app -> components -> context -> hooks -> infra -> lib -> types`).

## Parallel Route Design Rules

### 1) Use slot-based composition

- Use `@slot` route segments for independent UI regions (e.g., `@analytics`, `@activity`, `@modal`).
- Keep each slot self-contained with its own `page.tsx` and optional `loading.tsx` / `error.tsx`.
- Avoid cross-slot coupling through local component imports; coordinate only via shared context/hooks when necessary.

### 2) Use intercepting routes for overlays/modals

- For detail overlays from list pages, prefer intercepting routes:
  - `app/.../(.)item/[id]/page.tsx` (same-level interception)
  - `app/.../(..)item/[id]/page.tsx` (one-level up interception)
- Preserve direct URL access by also providing non-intercepted canonical routes.

### 3) Keep layouts thin and deterministic

- Layouts should orchestrate slots and shared chrome only.
- Do not place feature business logic in layout files.
- For route params in modern Next.js typing contexts, treat `params` as async-compatible when required by generated route types.

## Data Fetching and Rendering Rules

### 1) Server-first strategy

- Fetch data in Server Components whenever possible.
- Pass only necessary DTO fields to Client Components.
- Avoid fetching your own internal API route from Server Components just to reuse logic.

### 2) Client boundaries only where needed

- Add `'use client'` only for state, browser APIs, and event handlers.
- Move heavy business logic into hooks/services instead of JSX files with large mixed responsibilities.

### 3) Streaming and fallback UX

- Use route-level `loading.tsx` for initial route suspense.
- Use local `Suspense` boundaries for sub-regions with independent latency.
- Add `error.tsx` for recoverable route-level runtime failures.

## Modern Code Generation Checklist

Before finalizing generated code, ensure:

- [ ] App Router structure follows slot conventions for parallel views.
- [ ] Intercepted modal routes also have canonical non-modal route.
- [ ] Server/Client boundaries are explicit and minimal.
- [ ] No direct infra calls from pure dumb UI components.
- [ ] New files use existing naming conventions and project style.
- [ ] Changes preserve existing behavior unless requirement explicitly changes UX.

## Anti-patterns to Avoid

- Overusing `'use client'` at route or layout level.
- Placing data mutations directly in presentational components.
- Coupling one parallel slot to another slot’s internal implementation.
- Adding new abstractions when a simple colocated hook/service solves the need.

