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

## Maps From (Legacy)

- `src/server-commands/files/` → `_actions.ts`
- `src/server-commands/storage/` → `_actions.ts`
- `src/react-hooks/service-hooks/use-storage.ts` → `_hooks/`
- `src/react-hooks/state-hooks/use-workspace-filters.ts` → `_hooks/`
- `src/view-modules/workspaces/plugins/files/` → `_components/`

## Public API (`index.ts`)

```ts
export { FilesPlugin } from "./_components/files-plugin";
```

## Who Uses This Slice?

- `app/dashboard/workspaces/[id]/@plugin-tab/files/page.tsx`
