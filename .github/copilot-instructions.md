# Copilot Instructions for `7Spade/xuanwu-xxx`

This repository is onboarding Copilot with a **minimal, architecture-first rule set**.

## Core principles

- Follow **Occam's Razor**: prefer the simplest change that fully solves the task.
- Keep code in the repository's **Vertical Slice Architecture (VSA)**.
- Keep changes **small and local**; avoid creating new abstractions unless required.

## Architecture rules (must follow)

- Top-level structure:
  - `src/app`: Next.js App Router composition only
  - `src/features`: business-domain vertical slices
  - `src/shared`: cross-cutting infrastructure
- Dependency direction:
  - `app -> features/{slice}/index.ts -> shared`
- Cross-slice access:
  - Import from another slice via its `index.ts` public API only.
  - Do not import private `_` files across slices.

## Parallel routes + Next.js App Router

- The project uses **parallel routes** (for example `@sidebar`, `@modal`, `@header`, `@plugintab`) and route groups.
- Keep layouts thin: compose slots and shared chrome, do not add feature business logic in layout files.
- Preserve current route behavior when editing slot routes or intercepting routes.

## Working style for Copilot

- Prioritize existing patterns in `src/features/*` and `src/app/*`.
- Prefer server-first Next.js patterns and minimal client boundaries.
- Validate with existing commands when relevant:
  - `npm run lint`
  - `npm run typecheck`
