/**
 * @fileoverview issue.actions.ts - Pure business logic for workspace issue operations.
 * @description Contains framework-agnostic action functions for creating issues and
 * posting comments. These functions can be called from React hooks, context, or
 * future Server Actions without any React dependencies.
 */

import {
  createIssue as createIssueFacade,
  addCommentToIssue as addCommentToIssueFacade,
} from "@/infra/firebase/firestore/firestore.facade"

export async function createIssue(
  workspaceId: string,
  title: string,
  type: "technical" | "financial",
  priority: "high" | "medium"
): Promise<void> {
  return createIssueFacade(workspaceId, title, type, priority)
}

export async function addCommentToIssue(
  workspaceId: string,
  issueId: string,
  author: string,
  content: string
): Promise<void> {
  return addCommentToIssueFacade(workspaceId, issueId, author, content)
}
