/**
 * @fileoverview shared/lib/task — Pure task domain rules.
 * No async, no I/O, no React, no Firebase.
 */

import type { WorkspaceTask, TaskWithChildren } from "@/shared/types";

/** A task is considered "divisible" (quantity-based) when its quantity exceeds this threshold. */
const MULTI_QUANTITY_THRESHOLD = 1;
/** Default quantity for tasks that do not explicitly set one. */
const DEFAULT_QUANTITY = 1;
/** Progress percentage representing full completion. */
const FULL_PROGRESS = 100;
/** Terminal states that count as completed for atomic (non-divisible) tasks. */
const COMPLETED_STATES: WorkspaceTask["progressState"][] = [
  "completed",
  "verified",
  "accepted",
];

/**
 * Builds a recursive task tree from a flat list of WorkspaceTask records.
 * Calculates WBS numbering, descendant subtotal sums, and progress per node.
 */
export const buildTaskTree = (tasks: WorkspaceTask[]): TaskWithChildren[] => {
  if (!tasks || tasks.length === 0) return [];
  const map: Record<string, TaskWithChildren> = {};
  tasks.forEach(
    (t) => (map[t.id] = { ...t, children: [], descendantSum: 0, wbsNo: "", progress: 0 })
  );
  const roots: TaskWithChildren[] = [];

  const build = (
    node: TaskWithChildren,
    parentNo: string,
    index: number,
    path: Set<string>
  ) => {
    if (path.has(node.id)) {
      console.error("Circular dependency detected in tasks:", node.id);
      return 0;
    }
    const newPath = new Set(path);
    newPath.add(node.id);

    node.wbsNo = parentNo ? `${parentNo}.${index + 1}` : `${index + 1}`;
    let sum = 0;
    (tasks.filter((t) => t.parentId === node.id) || []).forEach((child, i) => {
      const childNode = map[child.id];
      if (childNode) {
        sum +=
          (childNode.subtotal || 0) + build(childNode, node.wbsNo, i, newPath);
        node.children.push(childNode);
      }
    });
    node.descendantSum = sum;

    if (node.children.length === 0) {
      if ((node.quantity ?? DEFAULT_QUANTITY) > MULTI_QUANTITY_THRESHOLD) {
        const completed = node.completedQuantity || 0;
        const total = node.quantity!;
        node.progress = total > 0 ? Math.round((completed / total) * FULL_PROGRESS) : 0;
      } else {
        node.progress = COMPLETED_STATES.includes(node.progressState) ? FULL_PROGRESS : 0;
      }
    } else {
      const weightedProgressSum = node.children.reduce(
        (acc, child) => acc + (child.progress || 0) * (child.subtotal || 0),
        0
      );
      const totalChildSubtotal = node.children.reduce(
        (acc, child) => acc + (child.subtotal || 0),
        0
      );

      if (totalChildSubtotal > 0) {
        node.progress = Math.round(weightedProgressSum / totalChildSubtotal);
      } else {
        const allChildrenComplete = node.children.every(c => c.progress === FULL_PROGRESS);
        node.progress = allChildrenComplete ? FULL_PROGRESS : 0;
      }
    }

    return sum;
  };

  (tasks.filter((t) => !t.parentId) || []).forEach((root, i) => {
    const rootNode = map[root.id];
    if (rootNode) {
      build(rootNode, "", i, new Set<string>());
      roots.push(rootNode);
    }
  });

  return roots;
};
