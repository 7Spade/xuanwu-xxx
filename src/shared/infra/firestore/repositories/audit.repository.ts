/**
 * @fileoverview Audit Log Repository.
 *
 * Read operations for the `auditLogs` sub-collection under an account.
 * Stored at: accounts/{accountId}/auditLogs/{logId}
 */

import {
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  where,
} from 'firebase/firestore'
import { db } from '../firestore.client'
import { getDocuments } from '../firestore.read.adapter'
import { createConverter } from '../firestore.converter'
import type { AuditLog } from '@/shared/types'

export const getAuditLogs = async (
  accountId: string,
  workspaceId?: string,
  limitCount = 50
): Promise<AuditLog[]> => {
  const converter = createConverter<AuditLog>()
  const colRef = collection(
    db,
    `accounts/${accountId}/auditLogs`
  ).withConverter(converter)
  const constraints = workspaceId
    ? [
        where('workspaceId', '==', workspaceId),
        orderBy('recordedAt', 'desc'),
        firestoreLimit(limitCount),
      ]
    : [orderBy('recordedAt', 'desc'), firestoreLimit(limitCount)]
  const q = query(colRef, ...constraints)
  return getDocuments(q)
}
