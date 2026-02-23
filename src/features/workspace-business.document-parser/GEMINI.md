# Feature Slice: `workspace-business.document-parser`

## Domain

AI document parsing — extract structured data (e.g. invoice line items) from uploaded documents
using Genkit + Gemini.

## Responsibilities

- Parse PDF / image documents via AI
- Extract invoice items (量化清單)
- Display parsed results in workspace plugin

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `parseDocument` (calls Genkit flow server-side) |
| `_components/` | `DocumentParserPlugin` |
| `index.ts` | Public exports |

## Note

The Genkit flow itself stays in `@/shared/ai/`. This slice's `_actions.ts` calls
`@/shared/ai` to invoke the flow and returns the structured result to the UI.

## Public API (`index.ts`)

```ts
export { DocumentParserPlugin } from "./_components/document-parser-plugin";
```

## Who Uses This Slice?

- `app/dashboard/workspaces/[id]/@plugin-tab/document-parser/page.tsx`
