/**
 * @fileoverview entities/user — Pure user domain rules.
 * No async, no I/O, no React, no Firebase.
 */

import type { Account } from "@/shared/types"

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/**
 * Returns true if the account represents an anonymous (guest) user.
 * Anonymous users have no email address.
 */
export function isAnonymousUser(account: Account): boolean {
  return account.accountType === "user" && !account.email
}
