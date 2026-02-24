/**
 * @fileoverview task.commands.ts - Pure business logic for workspace task operations.
 * @description Contains framework-agnostic action functions for creating, updating,
 * and deleting workspace tasks. These functions can be called from React hooks,
 * context, or future Server Actions without any React dependencies.
 */

import {
  createTask as createTaskFacade,
  updateTask as updateTaskFacade,
  deleteTask as deleteTaskFacade,
  getWorkspaceTasks as getWorkspaceTasksFacade,
  getWorkspaceTask as getWorkspaceTaskFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { WorkspaceTask } from "@/shared/types"

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
  // sourceIntentId is a readonly SourcePointer (Digital Twin anchor) — strip it from updates.
  const { sourceIntentId: _sourceIntentId, ...safeUpdates } = updates
  return updateTaskFacade(workspaceId, taskId, safeUpdates)
}

export async function deleteTask(
  workspaceId: string,
  taskId: string
): Promise<void> {
  return deleteTaskFacade(workspaceId, taskId)
}

/**
 * Imports multiple tasks into a workspace in parallel.
 * @param workspaceId The ID of the workspace.
 * @param items Array of task data objects to create (without id/timestamps).
 * @returns A promise that resolves when all tasks are created.
 */
export async function batchImportTasks(
  workspaceId: string,
  items: Omit<WorkspaceTask, "id" | "createdAt" | "updatedAt">[]
): Promise<void> {
  await Promise.all(items.map((item) => createTaskFacade(workspaceId, item)))
}

/**
 * Fetches all tasks for a workspace (one-time read, not real-time).
 * @param workspaceId The ID of the workspace.
 */
export async function getWorkspaceTasks(
  workspaceId: string
): Promise<WorkspaceTask[]> {
  return getWorkspaceTasksFacade(workspaceId)
}

/**
 * Fetches a single task by ID from a workspace (one-time read, not real-time).
 * @param workspaceId The ID of the workspace.
 * @param taskId The ID of the task.
 */
export async function getWorkspaceTask(
  workspaceId: string,
  taskId: string
): Promise<WorkspaceTask | null> {
  return getWorkspaceTaskFacade(workspaceId, taskId)
}
