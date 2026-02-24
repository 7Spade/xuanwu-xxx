/**
 * @fileoverview user.commands.ts - Pure business logic for user account operations.
 * @description Contains framework-agnostic action functions for creating user
 * accounts and managing user profiles. These functions can be called from React
 * hooks, context, or future Server Actions without any React dependencies.
 */

import {
  createUserAccount as createUserAccountFacade,
  updateUserProfile as updateUserProfileFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { Account } from "@/shared/types"

export async function createUserAccount(
  userId: string,
  name: string,
  email: string
): Promise<void> {
  return createUserAccountFacade(userId, name, email)
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Account>
): Promise<void> {
  return updateUserProfileFacade(userId, data)
}
