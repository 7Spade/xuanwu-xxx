# `src/layouts/` — Shared Layout Components (Reserved)

> **Status: Reserved for future use.**  
> In Next.js App Router, layouts live in `src/app/**/layout.tsx`.  
> This directory is reserved for **extracted, reusable layout primitives** if they become needed across multiple routes.

## What would belong here (if used)

- Layout shell components shared across unrelated routes (e.g. a `TwoColumnLayout`, `FullScreenLayout`)
- Layout-level providers that are not route-specific

## What does NOT belong here

- Route-specific layouts → `src/app/{route}/layout.tsx`
- Navigation components → `src/app/_components/sidebar/` or `src/app/_components/layout/`

## Current guidance

Do **not** create files here unless a layout pattern genuinely appears in 3+ unrelated routes.  
Prefer colocating layouts with their routes in `src/app/`.
