/**
 * @fileoverview features/auth — Multi-step authentication use cases.
 * No React. No UI. Callable from hooks, context, or Server Actions.
 */

import { registerUser } from "@/actions/auth"
import { createUserAccount } from "@/actions/user"

/**
 * Registers a new user with Firebase Auth and creates their Firestore account
 * profile in a single atomic use case.
 *
 * @param email    User's email address
 * @param password User's chosen password
 * @param name     User's display name
 */
export async function completeRegistration(
  email: string,
  password: string,
  name: string
): Promise<void> {
  const uid = await registerUser(email, password, name)
  await createUserAccount(uid, name, email)
}
