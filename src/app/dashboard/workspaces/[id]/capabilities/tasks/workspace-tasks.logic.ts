import type { WorkspaceTask } from "@/types/domain";
import type { TaskWithChildren } from "./workspace-tasks.types";

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
      return 0; // Stop recursion
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

    // New progress calculation logic
    if (node.children.length === 0) {
      // Leaf node: progress is based on quantity or binary state
      if ((node.quantity ?? 1) > 1) {
        // Divisible task
        const completed = node.completedQuantity || 0;
        const total = node.quantity!;
        node.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      } else {
        // Atomic task
        node.progress = ['completed', 'verified', 'accepted'].includes(node.progressState) ? 100 : 0;
      }
    } else {
      // Parent node: progress is a weighted average of children's progress
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
        // If children have no value, progress is 100 only if all are complete.
        const allChildrenComplete = node.children.every(c => c.progress === 100);
        node.progress = allChildrenComplete ? 100 : 0;
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
