/**
 * @fileoverview Schedule Repository.
 *
 * All Firestore read and write operations for the `schedule_items` sub-collection
 * under an account. Stored at: accounts/{accountId}/schedule_items/{itemId}
 */

import {
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  doc,
  updateDoc,
  collection,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { db } from '../firestore.client'
import { addDocument, updateDocument } from '../firestore.write.adapter'
import { getDocuments } from '../firestore.read.adapter'
import { createConverter } from '../firestore.converter'
import type { ScheduleItem } from '@/shared/types'

export const createScheduleItem = async (
  itemData: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  // Build the Firestore document explicitly.
  // Firestore rejects documents containing `undefined` field values, so optional
  // fields are only included when they carry a meaningful value.
  const data = {
    accountId: itemData.accountId,
    workspaceId: itemData.workspaceId,
    title: itemData.title,
    startDate: itemData.startDate,
    endDate: itemData.endDate,
    status: itemData.status,
    originType: itemData.originType,
    assigneeIds: itemData.assigneeIds ?? [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    // Optional fields — omitted when undefined so Firestore never sees undefined.
    // Use !== undefined (not truthy) so empty strings are preserved if ever valid.
    ...(itemData.workspaceName !== undefined ? { workspaceName: itemData.workspaceName } : {}),
    ...(itemData.description !== undefined ? { description: itemData.description } : {}),
    ...(itemData.originTaskId !== undefined ? { originTaskId: itemData.originTaskId } : {}),
    ...(itemData.location !== undefined ? { location: itemData.location } : {}),
    ...(itemData.requiredSkills?.length ? { requiredSkills: itemData.requiredSkills } : {}),
  }
  const docRef = await addDocument(
    `accounts/${itemData.accountId}/schedule_items`,
    data
  )
  return docRef.id
}

export const updateScheduleItemStatus = async (
  organizationId: string,
  itemId: string,
  newStatus: 'OFFICIAL' | 'REJECTED'
): Promise<void> => {
  const itemRef = doc(db, `accounts/${organizationId}/schedule_items`, itemId)
  return updateDoc(itemRef, { status: newStatus, updatedAt: serverTimestamp() })
}

export const assignMemberToScheduleItem = async (
  accountId: string,
  itemId: string,
  memberId: string
): Promise<void> => {
  return updateDocument(`accounts/${accountId}/schedule_items/${itemId}`, {
    assigneeIds: arrayUnion(memberId),
  })
}

export const unassignMemberFromScheduleItem = async (
  accountId: string,
  itemId: string,
  memberId: string
): Promise<void> => {
  return updateDocument(`accounts/${accountId}/schedule_items/${itemId}`, {
    assigneeIds: arrayRemove(memberId),
  })
}

export const getScheduleItems = async (
  accountId: string,
  workspaceId?: string
): Promise<ScheduleItem[]> => {
  const converter = createConverter<ScheduleItem>()
  const colRef = collection(
    db,
    `accounts/${accountId}/schedule_items`
  ).withConverter(converter)
  const constraints = workspaceId
    ? [where('workspaceId', '==', workspaceId), orderBy('startDate', 'asc')]
    : [orderBy('startDate', 'asc')]
  const q = query(colRef, ...constraints)
  return getDocuments(q)
}
