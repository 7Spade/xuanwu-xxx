/**
 * @fileoverview User Repository.
 *
 * Firestore operations for user profiles and personal bookmarks.
 * Stored at: accounts/{userId} and accounts/{userId}/bookmarks/{logId}
 */

import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firestore.client'
import { setDocument } from '../firestore.write.adapter'
import type { Account } from '@/shared/types'

export const getUserProfile = async (
  userId: string
): Promise<Account | null> => {
  const docRef = doc(db, 'accounts', userId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Account
  } else {
    const defaultProfile: Omit<Account, 'id'> = {
      name: '',
      accountType: 'user',
      bio: '',
      photoURL: '',
      achievements: [],
      expertiseBadges: [],
    }
    await setDocument(`accounts/${userId}`, defaultProfile)
    return { id: userId, ...defaultProfile }
  }
}

export const updateUserProfile = async (
  userId: string,
  data: Partial<Account>
): Promise<void> => {
  const docRef = doc(db, 'accounts', userId)
  return setDoc(docRef, data, { merge: true })
}

export const addBookmark = async (
  userId: string,
  logId: string
): Promise<void> => {
  const bookmarkRef = doc(db, `accounts/${userId}/bookmarks`, logId)
  await setDoc(bookmarkRef, {})
}

export const removeBookmark = async (
  userId: string,
  logId: string
): Promise<void> => {
  const bookmarkRef = doc(db, `accounts/${userId}/bookmarks`, logId)
  await deleteDoc(bookmarkRef)
}
