# Feature Slice: `workspace-business.files`

## Domain

File management — upload, list, and delete workspace files.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `uploadFile`, `deleteFile`, `getFiles` |
| `_hooks/` | `useStorage`, `useWorkspaceFilters` |
| `_components/` | `WorkspaceFiles` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { WorkspaceFiles } from "./_components/files-view";
```

## Who Uses This Slice?

- `app/(shell)/(account)/(workspaces)/workspaces/[id]/@businesstab/files/page.tsx`
