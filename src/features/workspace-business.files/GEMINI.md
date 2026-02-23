# Feature Slice: `workspace-business.files`

## Domain

File management — upload, list, and delete workspace files.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `uploadFile`, `deleteFile`, `getFiles` |
| `_hooks/` | `useStorage`, `useWorkspaceFilters` |
| `_components/` | `FilesPlugin` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { FilesPlugin } from "./_components/files-plugin";
```

## Who Uses This Slice?

- `app/dashboard/workspaces/[id]/@plugin-tab/files/page.tsx`
