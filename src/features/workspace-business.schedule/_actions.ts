/**
 * @fileoverview schedule.commands.ts - Pure business logic for schedule item interactions.
 * @description Contains framework-agnostic action functions for managing member
 * assignments on schedule items. These functions can be called from React hooks,
 * context, or future Server Actions without any React dependencies.
 */

import {
  assignMemberToScheduleItem,
  unassignMemberFromScheduleItem,
  createScheduleItem as createScheduleItemFacade,
  updateScheduleItemStatus as updateScheduleItemStatusFacade,
  getScheduleItems as getScheduleItemsFacade,
} from "@/shared/infra/firestore/firestore.facade"
import type { ScheduleItem } from "@/shared/types"

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

/**
 * Creates a new schedule item in the account's schedule sub-collection.
 * @param itemData The data for the new schedule item (without id, createdAt, updatedAt).
 * @returns The ID of the newly created schedule item.
 */
export async function createScheduleItem(
  itemData: Omit<ScheduleItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  return createScheduleItemFacade(itemData)
}

/**
 * Updates the approval status of a schedule item.
 * @param organizationId The ID of the organization that owns the schedule item.
 * @param itemId The ID of the schedule item.
 * @param newStatus The new status to set ('OFFICIAL' or 'REJECTED').
 */
export async function updateScheduleItemStatus(
  organizationId: string,
  itemId: string,
  newStatus: "OFFICIAL" | "REJECTED"
): Promise<void> {
  return updateScheduleItemStatusFacade(organizationId, itemId, newStatus)
}

/**
 * Fetches all schedule items for an account, optionally filtered by workspace.
 * @param accountId The ID of the organization account.
 * @param workspaceId Optional workspace ID to filter items.
 */
export async function getScheduleItems(
  accountId: string,
  workspaceId?: string
): Promise<ScheduleItem[]> {
  return getScheduleItemsFacade(accountId, workspaceId)
}
