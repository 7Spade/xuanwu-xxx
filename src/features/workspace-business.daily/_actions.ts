/**
 * @fileoverview daily.commands.ts - Pure business logic for daily log interactions.
 * @description Contains framework-agnostic action functions for interactive features
 * on daily log entries. These functions can be called from React hooks, context,
 * or future Server Actions without any React dependencies.
 */

import {
  toggleDailyLogLike,
  addDailyLogComment as addDailyLogCommentFacade,
  getDailyLogs as getDailyLogsFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { DailyLog } from "@/shared/types"

/**
 * Toggles a like on a daily log entry.
 * @param accountId The ID of the organization account that owns the log.
 * @param logId The ID of the daily log entry.
 * @param userId The ID of the user performing the like/unlike.
 */
export async function toggleLike(
  accountId: string,
  logId: string,
  userId: string
): Promise<void> {
  await toggleDailyLogLike(accountId, logId, userId)
}

/**
 * Adds a comment to a daily log entry.
 * @param organizationId The ID of the organization that owns the log.
 * @param logId The ID of the daily log entry.
 * @param author The author information for the comment.
 * @param content The text content of the comment.
 */
export async function addDailyLogComment(
  organizationId: string,
  logId: string,
  author: { uid: string; name: string; avatarUrl?: string },
  content: string
): Promise<void> {
  await addDailyLogCommentFacade(organizationId, logId, author, content)
}

/**
 * Fetches daily log entries for an account.
 * @param accountId The ID of the organization account.
 * @param limit Maximum number of logs to return (default: 30).
 */
export async function getDailyLogs(
  accountId: string,
  limit = 30
): Promise<DailyLog[]> {
  return getDailyLogsFacade(accountId, limit)
}
