# Feature Slice: `workspace-business.acceptance`

## Domain

Acceptance (驗收) — A-track business view that tracks acceptance status of deliverables.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_components/` | `WorkspaceAcceptance` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { WorkspaceAcceptance } from "./_components/acceptance-view";
```

## Who Uses This Slice?

- `app/(shell)/(account)/(workspaces)/workspaces/[id]/@businesstab/acceptance/page.tsx`
