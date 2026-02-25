# Feature Slice: `workspace-business.parsing-intent`

## Domain

ParsingIntent contract baseline.

This slice defines the minimal long-lived intent contract that decouples:

- document parsing output
- downstream task/schedule decision flow

## Responsibilities

- Define ParsingIntent contract shape
- Provide pure helpers for lifecycle transitions
- Keep intent identity and supersede chain explicit

## Internal Files

| File | Purpose |
|------|---------|
| `_contract.ts` | ParsingIntent contract type and transition helpers |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export {
  createParsingIntentContract,
  markParsingIntentImported,
  supersedeParsingIntent,
} from './_contract';
export type { ParsingIntentContract, ParsingIntentStatus } from './_contract';
```

## Architecture Note

Aligned with `logic-overview.v3.md`:
`PARSING_INTENT` is treated as a durable contract layer, not a transient parser buffer.
