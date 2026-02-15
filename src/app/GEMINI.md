# Project: Application Entry Layer

## 1. Responsibility

This directory is the root of the Next.js App Router. It contains all pages, layouts, and route-specific components. It is the top layer of the application, responsible for composing the UI by assembling components and providing them with the necessary data and logic from the lower layers.

## 2. Dependency Rules

This is the top-most layer and can depend on any layer below it.

### Allowed Imports:
- `src/types`
- `src/lib`
- `src/infra` (Though preferably data should come via `context` or `hooks`)
- `src/hooks`
- `src/context`
- `src/components`
- `src/ai`

### Disallowed Imports:
- None. As the top layer, it assembles everything else.

## 3. Who Depends on This Layer?

**No one.** No other layer (`types`, `lib`, `infra`, `hooks`, `context`, `components`, `ai`) should ever import from the `app` directory. This would create a circular dependency and violate the one-way data flow architecture.
