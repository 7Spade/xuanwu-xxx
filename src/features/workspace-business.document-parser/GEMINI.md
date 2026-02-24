# Feature Slice: `workspace-business.document-parser`

## Domain

AI document parsing — extract structured data (e.g. invoice line items) from uploaded documents
using Genkit + Gemini. Produces a `ParsingIntent` Digital Twin for full traceability.

## Responsibilities

- Parse PDF / image documents via AI
- Extract invoice items (量化清單)
- Persist `ParsingIntent` as Digital Twin before importing tasks
- Display parsed results in workspace business view

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `parseDocument` (calls Genkit flow server-side) |
| `_intent-actions.ts` | `saveParsingIntent`, `markParsingIntentImported` |
| `_components/` | `WorkspaceDocumentParser` |
| `index.ts` | Public exports |

## Note

The Genkit flow itself stays in `@/shared/ai/`. This slice's `_actions.ts` calls
`@/shared/ai` to invoke the flow and returns the structured result to the UI.

## Public API (`index.ts`)

```ts
export { WorkspaceDocumentParser } from "./_components/document-parser-view";
export { saveParsingIntent, markParsingIntentImported } from "./_intent-actions";
```

## Who Uses This Slice?

- `app/(shell)/(account)/(workspaces)/workspaces/[id]/@businesstab/document-parser/page.tsx`
