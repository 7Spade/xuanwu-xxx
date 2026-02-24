# Feature Slice: `workspace-business.tasks`

## Domain

Task management — task tree hierarchy, CRUD, batch import (A-track start).

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createTask`, `updateTask`, `deleteTask`, `batchImportTasks` |
| `_queries.ts` | Firestore listeners for task list |
| `_components/` | `WorkspaceTasks` |
| `index.ts` | Public exports |

## Business Rules

- `buildTaskTree(tasks)` → lives in `@/shared/lib` (pure, no side effects)

## Public API (`index.ts`)

```ts
export { WorkspaceTasks } from "./_components/tasks-view";
```

## Who Uses This Slice?

- `app/(shell)/(account)/(workspaces)/workspaces/[id]/@businesstab/tasks/page.tsx`
