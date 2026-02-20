/**
 * @fileoverview auth.actions.ts - Pure business logic for authentication operations.
 * @description Contains framework-agnostic action functions for Firebase Auth operations.
 * These functions can be called from React components, hooks, or future Server Actions
 * without any React dependencies.
 */

import { authAdapter } from "@/firebase/auth/auth.adapter"

/**
 * Signs in an existing user with email and password.
 */
export async function signIn(email: string, password: string): Promise<void> {
  await authAdapter.signInWithEmailAndPassword(email, password)
}

/**
 * Registers a new user with email and password, sets their display name,
 * and returns the new Firebase user's uid.
 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<string> {
  const { user } = await authAdapter.createUserWithEmailAndPassword(
    email,
    password
  )
  await authAdapter.updateProfile(user, { displayName })
  return user.uid
}

/**
 * Signs in anonymously.
 */
export async function signInAnonymously(): Promise<void> {
  await authAdapter.signInAnonymously()
}

/**
 * Sends a password reset email.
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  await authAdapter.sendPasswordResetEmail(email)
}

/**
 * Signs out the current user.
 */
export async function signOut(): Promise<void> {
  await authAdapter.signOut()
}
