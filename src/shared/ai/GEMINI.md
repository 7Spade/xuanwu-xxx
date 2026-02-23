# Shared Module: `ai` (`src/shared/ai/`)

## Role

Generative AI — Genkit flows and schemas for LLM-powered operations. Server-only.

## Contents

```
shared/ai/
├── genkit.ts              ← Genkit initialization
├── dev.ts                 ← Dev server entry
├── flows/
│   ├── adapt-ui-color-to-account-context.ts
│   └── extract-invoice-items.ts
└── schemas/
    └── docu-parse.ts
```

## Rules

- Server-only — never imported in client components
- Only depends on `@/shared/types`
- Feature slices call AI via their own `_actions.ts` (which calls `@/shared/ai`)
- Never call AI flows directly from UI components

## Alias

```ts
// Used from feature _actions.ts only
import { extractInvoiceItems } from "@/shared/ai/flows/extract-invoice-items";
```
