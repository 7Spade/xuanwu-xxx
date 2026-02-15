
'use client';

import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { useFirebase } from '@/context/firebase-context';
import {
  updateUserProfile,
  getUserProfile,
} from '@/infra/firebase/firestore/firestore.facade';
import { uploadProfilePicture } from '@/infra/firebase/storage/storage.facade';
import type { UserProfile } from '@/types/domain';

/**
 * @fileoverview A hook for managing the current user's profile data.
 * This hook acts as the designated bridge between UI components and the
 * underlying infrastructure for user profile management.
 */
export function useUser() {
  const { state: authState } = useAuth();
  const { user } = authState;
  const { db } = useFirebase();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Set up a real-time listener for the user's profile document.
    const unsub = onSnapshot(doc(db, 'users', user.id), (doc) => {
      if (doc.exists()) {
        setProfile({ id: doc.id, ...doc.data() } as UserProfile);
      } else {
        // If profile doesn't exist, create a default one.
        getUserProfile(user.id).then(setProfile);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsub();
  }, [user, db]);

  const updateProfile = useCallback(
    async (data: Partial<Omit<UserProfile, 'id'>>) => {
      if (!user) throw new Error('User not authenticated.');
      await updateUserProfile(user.id, data);
    },
    [user]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) throw new Error('User not authenticated.');
      const photoURL = await uploadProfilePicture(user.id, file);
      await updateProfile({ photoURL });
      return photoURL;
    },
    [user, updateProfile]
  );

  return { profile, loading, updateProfile, uploadAvatar };
}
