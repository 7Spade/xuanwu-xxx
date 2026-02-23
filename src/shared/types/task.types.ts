import type { WorkspaceTask } from './workspace.types'

// ---------------------------------------------------------------------------
// Derived / computed task types (used by buildTaskTree in shared/lib/task)
// ---------------------------------------------------------------------------

export type TaskWithChildren = WorkspaceTask & {
  children: TaskWithChildren[];
  descendantSum: number;
  wbsNo: string;
  progress: number;
}
