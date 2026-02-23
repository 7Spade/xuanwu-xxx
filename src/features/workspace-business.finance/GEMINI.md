# Feature Slice: `workspace-business.finance`

## Domain

Finance workspace plugin — financial data within a workspace context.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_components/` | `FinancePlugin` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { FinancePlugin } from "./_components/finance-plugin";
```

## Who Uses This Slice?

- `app/dashboard/workspaces/[id]/@plugin-tab/finance/page.tsx`
