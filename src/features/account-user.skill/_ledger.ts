/**
 * account-user.skill — _ledger.ts
 *
 * XP Ledger: immutable audit trail for every XP change.
 *
 * Schema (stored at: accountSkills/{accountId}/xpLedger/{entryId}):
 *   entryId   — auto-generated document ID (stable cross-BC reference)
 *   accountId — the owner of the XP
 *   skillId   — tagSlug of the skill being modified
 *   delta     — XP change (positive = added, negative = deducted)
 *   reason    — human-readable reason (e.g. "task:completed", "admin:correction")
 *   sourceId  — optional ID of the source event (taskId, scheduleItemId, etc.)
 *   timestamp — ISO 8601 creation time
 *
 * Invariant #13: XP changes MUST produce a ledger entry.
 *   Callers MUST call appendXpLedgerEntry() BEFORE updating the aggregate.
 *   This creates an auditable "happened-before" ordering in Firestore.
 *
 * NOTE: `tier` is intentionally absent from this schema (Invariant #12).
 */

import { addDocument } from '@/shared/infra/firestore/firestore.write.adapter';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface XpLedgerEntry {
  accountId: string;
  skillId: string;
  /**
   * XP change applied to the aggregate.
   * Positive = XP added, negative = XP deducted.
   * Represents the actual clamped delta (what actually changed), not the
   * requested delta (which may have been clamped at 0 or 525 boundary).
   */
  delta: number;
  /** Human-readable reason for the XP change. */
  reason: string;
  /**
   * Optional reference to the source domain object that caused this XP change
   * (e.g. a taskId, scheduleItemId, or "admin:manual").
   */
  sourceId?: string;
  /** ISO 8601 timestamp of when this ledger entry was created. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Appends an immutable XP ledger entry.
 *
 * MUST be called BEFORE updating the aggregate xp value.
 * Uses addDocument to let Firestore generate a stable entryId.
 *
 * Stored at: accountSkills/{accountId}/xpLedger/{auto-id}
 */
export async function appendXpLedgerEntry(
  accountId: string,
  entry: Omit<XpLedgerEntry, 'accountId' | 'timestamp'>
): Promise<string> {
  const fullEntry: XpLedgerEntry = {
    accountId,
    ...entry,
    timestamp: new Date().toISOString(),
  };
  const ref = await addDocument(
    `accountSkills/${accountId}/xpLedger`,
    fullEntry
  );
  return ref.id;
}
