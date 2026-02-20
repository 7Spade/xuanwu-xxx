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
import type { ScheduleItem } from '@/domain-types/schedule'

export const createScheduleItem = async (
  itemData: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const dataWithTimestamp = {
    ...itemData,
    assigneeIds: itemData.assigneeIds || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const docRef = await addDocument(
    `accounts/${itemData.accountId}/schedule_items`,
    dataWithTimestamp
  )
  return docRef.id
}

export const updateScheduleItemStatus = async (
  orgId: string,
  itemId: string,
  newStatus: 'OFFICIAL' | 'REJECTED'
): Promise<void> => {
  const itemRef = doc(db, `accounts/${orgId}/schedule_items`, itemId)
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
