/**
 * @fileoverview features/schedule — Multi-step schedule use cases.
 * Combines entity-level validation with infra action calls.
 * No React. No UI.
 */

import { canTransitionScheduleStatus } from "@/domain-rules/schedule"
import { updateScheduleItemStatus } from "@/server-commands/schedule"
import type { ScheduleItem } from "@/domain-types/domain"

/**
 * Validates that a PROPOSAL → OFFICIAL transition is permitted for the given
 * item, then persists the new status. Throws if the current state does not
 * allow approval.
 */
export async function approveScheduleItem(item: ScheduleItem): Promise<void> {
  if (!canTransitionScheduleStatus(item.status, "OFFICIAL")) {
    throw new Error(
      `Cannot approve: invalid transition ${item.status} → OFFICIAL`
    )
  }
  await updateScheduleItemStatus(item.accountId, item.id, "OFFICIAL")
}

/**
 * Validates that a PROPOSAL|OFFICIAL → REJECTED transition is permitted for
 * the given item, then persists the new status. Throws if the transition is
 * not valid for the current state.
 */
export async function rejectScheduleItem(item: ScheduleItem): Promise<void> {
  if (!canTransitionScheduleStatus(item.status, "REJECTED")) {
    throw new Error(
      `Cannot reject: invalid transition ${item.status} → REJECTED`
    )
  }
  await updateScheduleItemStatus(item.accountId, item.id, "REJECTED")
}
