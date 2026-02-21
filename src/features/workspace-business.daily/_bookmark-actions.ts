/**
 * @fileoverview bookmark.commands.ts - Pure business logic for bookmark operations.
 * @description Contains framework-agnostic action functions for managing a user's
 * personal bookmarks. These functions can be called from React hooks, context,
 * or future Server Actions without any React dependencies.
 */

import {
  addBookmark,
  removeBookmark,
} from "@/shared/infra/firestore/firestore.facade"

/**
 * Toggles a bookmark for a given log entry.
 * @param userId The ID of the user performing the action.
 * @param logId The ID of the log entry to bookmark or unbookmark.
 * @param shouldBookmark Whether to add (true) or remove (false) the bookmark.
 */
export async function toggleBookmark(
  userId: string,
  logId: string,
  shouldBookmark: boolean
): Promise<void> {
  if (shouldBookmark) {
    await addBookmark(userId, logId)
  } else {
    await removeBookmark(userId, logId)
  }
}
