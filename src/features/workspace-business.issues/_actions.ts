/**
 * @fileoverview issue.commands.ts - Pure business logic for workspace issue operations.
 * @description Contains framework-agnostic action functions for creating issues and
 * posting comments. These functions can be called from React hooks, context, or
 * future Server Actions without any React dependencies.
 */

import {
  createIssue as createIssueFacade,
  addCommentToIssue as addCommentToIssueFacade,
  resolveIssue as resolveIssueFacade,
} from "@/shared/infra/firestore/firestore.facade"

export async function createIssue(
  workspaceId: string,
  title: string,
  type: "technical" | "financial",
  priority: "high" | "medium",
  sourceTaskId?: string
): Promise<void> {
  return createIssueFacade(workspaceId, title, type, priority, sourceTaskId)
}

export async function addCommentToIssue(
  workspaceId: string,
  issueId: string,
  author: string,
  content: string
): Promise<void> {
  return addCommentToIssueFacade(workspaceId, issueId, author, content)
}

export async function resolveIssue(
  workspaceId: string,
  issueId: string
): Promise<void> {
  return resolveIssueFacade(workspaceId, issueId)
}
