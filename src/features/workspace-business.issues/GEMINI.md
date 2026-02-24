# Feature Slice: `workspace-business.issues`

## Domain

Issue tracking — create issues, add comments, track status (B-track).

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createIssue`, `updateIssue`, `addCommentToIssue` |
| `_components/` | `WorkspaceIssues` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { WorkspaceIssues } from "./_components/issues-view";
```

## Who Uses This Slice?

- `app/(shell)/(account)/(workspaces)/workspaces/[id]/@businesstab/issues/page.tsx`
