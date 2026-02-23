/**
 * @fileoverview Daily Log Repository.
 *
 * All Firestore read and write operations for the `dailyLogs` sub-collection
 * under an account. Stored at: accounts/{accountId}/dailyLogs/{logId}
 */

import {
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  doc,
  increment,
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  runTransaction,
  writeBatch,
  type FieldValue,
} from 'firebase/firestore'
import { db } from '../firestore.client'
import { getDocuments } from '../firestore.read.adapter'
import { createConverter } from '../firestore.converter'
import type { DailyLog, DailyLogComment } from '@/shared/types'

export const toggleDailyLogLike = async (
  organizationId: string,
  logId: string,
  userId: string
): Promise<void> => {
  const logRef = doc(db, `accounts/${organizationId}/dailyLogs`, logId)

  await runTransaction(db, async (transaction) => {
    const logDoc = await transaction.get(logRef)
    if (!logDoc.exists()) {
      throw new Error('Document does not exist!')
    }

    const logData = logDoc.data() as DailyLog
    const likes = logData.likes || []
    let newLikes
    let newLikeCount

    if (likes.includes(userId)) {
      newLikes = arrayRemove(userId)
      newLikeCount = increment(-1)
    } else {
      newLikes = arrayUnion(userId)
      newLikeCount = increment(1)
    }

    transaction.update(logRef, {
      likes: newLikes,
      likeCount: newLikeCount,
    })
  })
}

export const addDailyLogComment = async (
  organizationId: string,
  logId: string,
  author: { uid: string; name: string; avatarUrl?: string },
  content: string
): Promise<void> => {
  const logRef = doc(db, `accounts/${organizationId}/dailyLogs`, logId)
  const commentRef = doc(
    collection(db, `accounts/${organizationId}/dailyLogs/${logId}/comments`)
  )

  const newComment: Omit<DailyLogComment, 'id' | 'createdAt'> & {
    createdAt: FieldValue
  } = {
    author,
    content,
    createdAt: serverTimestamp(),
  }

  const batch = writeBatch(db)
  batch.set(commentRef, newComment)
  batch.update(logRef, { commentCount: increment(1) })

  await batch.commit()
}

export const getDailyLogs = async (
  accountId: string,
  limitCount = 30
): Promise<DailyLog[]> => {
  const converter = createConverter<DailyLog>()
  const colRef = collection(
    db,
    `accounts/${accountId}/dailyLogs`
  ).withConverter(converter)
  const q = query(
    colRef,
    orderBy('recordedAt', 'desc'),
    firestoreLimit(limitCount)
  )
  return getDocuments(q)
}
