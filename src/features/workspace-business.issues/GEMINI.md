# Feature Slice: `workspace-business.issues`

## Domain

Issue tracking — create issues, add comments, track status.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createIssue`, `updateIssue`, `addCommentToIssue` |
| `_components/` | `IssuesPlugin` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { IssuesPlugin } from "./_components/issues-plugin";
```

## Who Uses This Slice?

- `app/dashboard/workspaces/[id]/@plugin-tab/issues/page.tsx`
