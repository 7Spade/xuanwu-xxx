# Feature Slice: `workspace-business.finance`

## Domain

Finance — A-track business view for financial processing within a workspace context.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_components/` | `WorkspaceFinance` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { WorkspaceFinance } from "./_components/finance-view";
```

## Who Uses This Slice?

- `app/(shell)/(account)/(workspaces)/workspaces/[id]/@businesstab/finance/page.tsx`
