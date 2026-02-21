# Feature Slice: `acceptance`

## Domain

Acceptance (驗收) workspace plugin — track acceptance status of deliverables.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_components/` | `AcceptancePlugin` |
| `index.ts` | Public exports |

## Maps From (Legacy)

- `src/view-modules/workspaces/plugins/acceptance/` → `_components/`

## Public API (`index.ts`)

```ts
export { AcceptancePlugin } from "./_components/acceptance-plugin";
```

## Who Uses This Slice?

- `app/dashboard/workspaces/[id]/@plugin-tab/acceptance/page.tsx`
