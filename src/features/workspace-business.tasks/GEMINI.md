# Feature Slice: `workspace-business.tasks`

## Domain

Task management — task tree hierarchy, CRUD, batch import.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createTask`, `updateTask`, `deleteTask`, `batchImportTasks` |
| `_queries.ts` | Firestore listeners for task list |
| `_components/` | `TasksPlugin` |
| `index.ts` | Public exports |

## Business Rules

- `buildTaskTree(tasks)` → lives in `@/shared/lib` (pure, no side effects)

## Public API (`index.ts`)

```ts
export { TasksPlugin } from "./_components/tasks-plugin";
```

## Who Uses This Slice?

- `app/dashboard/workspaces/[id]/@plugin-tab/tasks/page.tsx`
