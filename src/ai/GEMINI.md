# Project: AI Layer

## 1. Responsibility

This directory contains all logic for interacting with Generative AI models. It uses a **provider abstraction pattern** to ensure single responsibility and easy extensibility to any AI provider (Gemini, OpenAI, Claude, etc.).

## 2. Directory Structure

- **`providers/`**: Provider implementations. All must conform to the `AIProvider` interface.
  - `provider.types.ts` — The `AIProvider` interface (the contract every provider must satisfy).
  - `gemini.provider.ts` — Gemini implementation via Genkit + Google AI (current default).
  - `openai.provider.ts` — OpenAI stub (ready for future implementation).
  - `claude.provider.ts` — Claude/Anthropic stub (ready for future implementation).
- **`index.ts`** — Exports the active `aiProvider`. **Edit this file to switch providers.**
- **`flows/`** — Provider-agnostic AI business logic. Each flow calls `aiProvider` — never a vendor SDK.
- **`schemas/`** — Shared Zod schemas for AI input/output validation.
- **`genkit.ts`** — Internal Genkit client (used only by `gemini.provider.ts`).

## 3. How to Switch Providers

Edit `src/ai/index.ts`:

```typescript
// Switch to OpenAI:
import { openaiProvider } from './providers/openai.provider'
export const aiProvider = openaiProvider
```

## 4. How to Add a New Provider

1. Create `src/ai/providers/<name>.provider.ts`
2. Implement the `AIProvider` interface from `provider.types.ts`
3. Update `src/ai/index.ts` to use the new provider

## 5. Dependency Rules

This layer must remain independent of the application's UI and state management. It provides server-side functions called from Server Actions.

### Allowed Imports:
- `src/types`
- `src/lib`

### Disallowed Imports:
- `import ... from '@/hooks/...'`
- `import ... from '@/context/...'`
- `import ... from '@/components/...'`
- `import ... from '@/app/...'`

## 6. Core Flows

- `adaptUIColorToAccountContext` — Determines UI colors based on account identity description.
- `extractInvoiceItems` — Extracts line items from an invoice or quote document (multimodal).

