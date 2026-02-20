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
app → components → context → hooks → actions → infra → lib → types
```

Each layer may only import from layers **below** it. Violating this causes circular dependencies.

## Source Layout

| Directory | Role |
|-----------|------|
| `src/types` | TypeScript domain types — zero dependencies |
| `src/lib` | Pure utility functions |
| `src/infra` | Firebase SDK wrappers (repositories + facade) |
| `src/actions` | Pure async business logic functions (no React) |
| `src/hooks` | React hooks — bridge between UI and logic |
| `src/context` | Global React state (providers) |
| `src/app` | Next.js App Router pages and layouts |
| `src/config` | App-wide constants and environment helpers |
| `src/styles` | Global CSS (`globals.css`, Tailwind base) |

## Key Docs

- `docs/architecture.md` — Architecture principles
- `docs/boundaries.md` — Layer dependency rules
- `docs/conventions.md` — Naming and coding standards
- `docs/schema.md` — Firestore data schema
- `docs/events.md` — WorkspaceEventBus event catalogue

