/**
 * @fileoverview User Profile Repository.
 *
 * This file contains all Firestore write operations related to a single user's
 * profile and their personal subcollections (e.g., bookmarks).
 */

import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firestore.client';
import { setDocument } from '../firestore.write.adapter';
import type { UserProfile } from '@/types/domain';

/**
 * Fetches a user's profile from Firestore.
 * @param userId The ID of the user whose profile is to be fetched.
 * @returns A promise that resolves to the UserProfile object or null if not found.
 */
export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  } else {
    // Optionally create a default profile if it doesn't exist
    const defaultProfile: UserProfile = {
      id: userId,
      bio: '',
      photoURL: '',
      achievements: [],
      expertiseBadges: [],
    };
    await setDocument(`users/${userId}`, defaultProfile);
    return defaultProfile;
  }
};

/**
 * Updates a user's profile in Firestore.
 * @param userId The ID of the user whose profile is to be updated.
 * @param data A partial UserProfile object with the fields to update.
 */
export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<void> => {
  // We use set with merge:true to handle both creation and update gracefully.
  const docRef = doc(db, 'users', userId);
  return setDoc(docRef, data, { merge: true });
};


/**
 * Adds a log to a user's bookmarks.
 * @param userId The ID of the user.
 * @param logId The ID of the daily log to bookmark.
 */
export const addBookmark = async (userId: string, logId: string): Promise<void> => {
    // We create an empty document where the ID is the logId for easy lookup.
    const bookmarkRef = doc(db, `users/${userId}/bookmarks`, logId);
    await setDoc(bookmarkRef, {});
};


/**
 * Removes a log from a user's bookmarks.
 * @param userId The ID of the user.
 * @param logId The ID of the daily log to unbookmark.
 */
export const removeBookmark = async (userId: string, logId: string): Promise<void> => {
    const bookmarkRef = doc(db, `users/${userId}/bookmarks`, logId);
    await deleteDoc(bookmarkRef);
};
