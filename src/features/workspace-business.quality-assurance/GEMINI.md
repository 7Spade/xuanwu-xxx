# Feature Slice: `workspace-business.quality-assurance`

## Domain

QA (Quality Assurance) workspace plugin.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_components/` | `WorkspaceQA` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { WorkspaceQA } from "./_components/qa-plugin";
```

## Who Uses This Slice?

- `app/(shell)/(account)/(workspaces)/workspaces/[id]/@plugintab/quality-assurance/page.tsx`
