/**
 * @fileoverview task.actions.ts - Pure business logic for workspace task operations.
 * @description Contains framework-agnostic action functions for creating, updating,
 * and deleting workspace tasks. These functions can be called from React hooks,
 * context, or future Server Actions without any React dependencies.
 */

import {
  createTask as createTaskFacade,
  updateTask as updateTaskFacade,
  deleteTask as deleteTaskFacade,
} from "@/infra/firebase/firestore/firestore.facade"
import type { WorkspaceTask } from "@/types/domain"

export async function createTask(
  workspaceId: string,
  taskData: Omit<WorkspaceTask, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  return createTaskFacade(workspaceId, taskData)
}

export async function updateTask(
  workspaceId: string,
  taskId: string,
  updates: Partial<WorkspaceTask>
): Promise<void> {
  return updateTaskFacade(workspaceId, taskId, updates)
}

export async function deleteTask(
  workspaceId: string,
  taskId: string
): Promise<void> {
  return deleteTaskFacade(workspaceId, taskId)
}
