import type { WorkspaceTask } from "@/types/domain";

export type TaskWithChildren = WorkspaceTask & {
  children: TaskWithChildren[];
  descendantSum: number;
  wbsNo: string;
};
