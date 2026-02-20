import type { WorkspaceTask } from "@/domain-types/domain";

export type TaskWithChildren = WorkspaceTask & {
  children: TaskWithChildren[];
  descendantSum: number;
  wbsNo: string;
};
