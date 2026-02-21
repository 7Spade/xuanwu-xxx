# Feature Slice: `workspace-business.qa`

## Domain

QA (Quality Assurance) workspace plugin.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_components/` | `QaPlugin` |
| `index.ts` | Public exports |

## Maps From (Legacy)

- `src/view-modules/workspaces/plugins/qa/` → `_components/`

## Public API (`index.ts`)

```ts
export { QaPlugin } from "./_components/qa-plugin";
```

## Who Uses This Slice?

- `app/dashboard/workspaces/[id]/@plugin-tab/qa/page.tsx`
