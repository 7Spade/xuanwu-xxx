# Project: Architecture Principles

## Core Principle

This project follows **Occam’s Razor**:

> Do not introduce more complexity than is strictly necessary.

All design, architecture, and implementation decisions must favor the **simplest possible solution that fully satisfies the requirements**.

## One-Way Dependency Architecture

The project enforces a strict one-way dependency flow. Each layer can only depend on layers below it. This prevents circular dependencies and creates a clear, maintainable, and testable structure. The `infra` layer is further organized using a **Repository Pattern** to separate data access logic by domain aggregate.

```
[ app ] -> [ components ] -> [ context ] -> [ hooks ] -> [ infra (facades -> repositories) ] -> [ lib ] -> [ types ]
```

### Layer Index

*   [`types/GEMINI.md`](./src/types/GEMINI.md): Core data structures and type definitions.
*   [`lib/GEMINI.md`](./src/lib/GEMINI.md): Pure, generic utility functions.
*   [`infra/GEMINI.md`](./src/infra/GEMINI.md): External service interactions (e.g., Firebase), organized with facades and repositories.
*   [`ai/GEMINI.md`](./src/ai/GEMINI.md): Generative AI interactions (e.g., Genkit).
*   [`hooks/GEMINI.md`](./src/hooks/GEMINI.md): Reusable UI and business logic.
*   [`context/GEMINI.md`](./src/context/GEMINI.md): Global state management.
*   [`components/GEMINI.md`](./src/components/GEMINI.md): Reusable UI components.
*   [`app/GEMINI.md`](./src/app/GEMINI.md): Application entry point, pages, and layouts.

## Review Checklist

Before adding code, ask:

*   Can this be done with fewer files?
*   Can this be done without a new abstraction?
*   Is this solving a real problem now?
*   Is there already a simpler equivalent in the codebase?

If the answer is **yes**, choose the simpler path.

## Final Note

Complexity is a liability. Simplicity is a feature.
