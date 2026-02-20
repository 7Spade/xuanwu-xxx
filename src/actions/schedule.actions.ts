/**
 * @fileoverview schedule.actions.ts - Pure business logic for schedule item interactions.
 * @description Contains framework-agnostic action functions for managing member
 * assignments on schedule items. These functions can be called from React hooks,
 * context, or future Server Actions without any React dependencies.
 */

import {
  assignMemberToScheduleItem,
  unassignMemberFromScheduleItem,
} from "@/infra/firebase/firestore/firestore.facade"

/**
 * Assigns a member to a schedule item.
 * @param accountId The ID of the organization account that owns the schedule item.
 * @param itemId The ID of the schedule item.
 * @param memberId The ID of the member to assign.
 */
export async function assignMember(
  accountId: string,
  itemId: string,
  memberId: string
): Promise<void> {
  await assignMemberToScheduleItem(accountId, itemId, memberId)
}

/**
 * Unassigns a member from a schedule item.
 * @param accountId The ID of the organization account that owns the schedule item.
 * @param itemId The ID of the schedule item.
 * @param memberId The ID of the member to unassign.
 */
export async function unassignMember(
  accountId: string,
  itemId: string,
  memberId: string
): Promise<void> {
  await unassignMemberFromScheduleItem(accountId, itemId, memberId)
}
