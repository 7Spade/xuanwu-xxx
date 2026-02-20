/**
 * @fileoverview use-bookmark-actions.ts - Hook for managing a user's personal bookmarks.
 * @description This hook provides logic for fetching, adding, and removing bookmarks,
 * which are stored in a dedicated subcollection for each user. It's self-contained
 * and loads its own data.
 */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/auth-context';
import { useFirebase } from '@/shared/context/firebase-context';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { toggleBookmark as toggleBookmarkAction } from '@/actions/bookmark';
import { toast } from '@/shared/hooks/use-toast';

export function useBookmarkActions() {
    const { state: authState } = useAuth();
    const { db } = useFirebase();
    const { user } = authState;
    
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !db) {
            setLoading(false);
            setBookmarks(new Set());
            return;
        };

        setLoading(true);
        const bookmarksQuery = query(collection(db, `accounts/${user.id}/bookmarks`));
        const unsubscribe = onSnapshot(bookmarksQuery, (snapshot) => {
            const bookmarkedIds = new Set(snapshot.docs.map(doc => doc.id));
            setBookmarks(bookmarkedIds);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching bookmarks:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, db]);

    const toggleBookmark = useCallback(async (logId: string, shouldBookmark: boolean) => {
        if (!user) return;
        try {
            await toggleBookmarkAction(user.id, logId, shouldBookmark);
        } catch (error) {
            console.error("Failed to toggle bookmark:", error);
            toast({ variant: 'destructive', title: 'Failed to update bookmark' });
            // Re-throw to allow the UI to revert its state
            throw error;
        }
    }, [user]);

    return { bookmarks, loading, toggleBookmark };
}
