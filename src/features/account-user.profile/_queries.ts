/**
 * account-user.profile — _queries.ts
 *
 * Read queries for user profile data.
 *
 * Per slice standard: reads live in _queries.ts; mutations live in _actions.ts.
 */

import {
  getUserProfile as getUserProfileFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { Account } from "@/shared/types"

/**
 * Fetches the user account/profile document by userId.
 */
export async function getUserProfile(userId: string): Promise<Account | null> {
  return getUserProfileFacade(userId)
}
