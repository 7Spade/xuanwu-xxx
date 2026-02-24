# Xuanwu

A collaborative workspace platform built with **Next.js 16 App Router**, **Firebase**, and **TypeScript**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Firebase (Firestore, Auth, Storage) |
| AI | Genkit (Google Generative AI) |
| State | React Context + useReducer |

## One-Way Dependency Architecture

```
app → features/{slice}/index.ts → shared
```

Each feature slice may only import from `shared/*` and other slices' `index.ts` public APIs. Violating this causes circular dependencies.

## Source Layout

| Directory | Role |
|-----------|------|
| `src/app` | Next.js App Router pages and layouts (pure composition) |
| `src/features` | 42 vertical feature slices — each owns its domain end-to-end |
| `src/shared/types` | TypeScript domain types — zero dependencies |
| `src/shared/lib` | Pure utility functions and domain rules |
| `src/shared/infra` | Firebase SDK wrappers (repositories + adapters) |
| `src/shared/ai` | Genkit AI flows (server-only) |
| `src/shared/ui` | shadcn/ui components, app-providers, i18n, constants |
| `src/styles` | Global CSS (`globals.css`, Tailwind base) |

## Key Docs

- `docs/overview/logic-overview.v3.md` — Canonical domain logic flow (source of truth)
- `docs/overview/architecture-overview.md` — Feature slice directory structure
- `docs/overview/command-event-overview.v3.md` — Commands and events
- `docs/overview/infrastructure-overview.v3.md` — Firebase infrastructure
- `docs/overview/persistence-model-overview.v3.md` — Firestore data schema

