# `src/features/` — Feature Modules (Reserved)

> **Status: Reserved for future use.**  
> The current architecture uses a route-colocated pattern inside `src/app/`.  
> This directory is reserved for self-contained feature modules if the codebase grows to need them.

## What would belong here (if used)

A feature module bundles everything for one domain slice:

```
src/features/billing/
  components/   ← UI components specific to billing
  hooks/        ← hooks specific to billing
  actions/      ← server actions specific to billing
  types.ts      ← local types
  index.ts      ← public API (explicit exports only)
```

## Rules (if used)

- Features may depend on `src/types`, `src/lib`, `src/infra`, `src/actions`
- Features must **not** import from each other — use shared layers instead
- Expose a public API via `index.ts`; never deep-import internal files from outside

## Current guidance

Do **not** create files here without first discussing the architectural change.  
Prefer adding code to the existing layers (`src/actions/`, `src/hooks/`, `src/app/`) unless a feature is large enough to justify isolation.
