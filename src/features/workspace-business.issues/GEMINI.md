# Feature Slice: `workspace-business.issues`

## Domain

Issue tracking — create issues, add comments, track status.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createIssue`, `updateIssue`, `addCommentToIssue` |
| `_components/` | `IssuesPlugin` |
| `index.ts` | Public exports |

## Maps From (Legacy)

- `src/server-commands/issue/` → `_actions.ts`
- `src/view-modules/workspaces/plugins/issues/` → `_components/`

## Public API (`index.ts`)

```ts
export { IssuesPlugin } from "./_components/issues-plugin";
```

## Who Uses This Slice?

- `app/dashboard/workspaces/[id]/@plugin-tab/issues/page.tsx`
