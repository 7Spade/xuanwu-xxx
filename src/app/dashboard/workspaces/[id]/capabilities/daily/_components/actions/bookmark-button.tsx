/**
 * @fileoverview bookmark-button.tsx - A self-contained component for the "bookmark" action.
 * @description This component encapsulates all UI and logic for bookmarking a daily log.
 * It uses a dedicated hook to manage its state and interactions, providing instant
 * optimistic UI feedback and a loading state to prevent race conditions.
 */
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useBookmarkActions } from '@/hooks/actions/use-bookmark-actions';
import { Button } from "@/app/_components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  logId: string;
}

export function BookmarkButton({ logId }: BookmarkButtonProps) {
  const { bookmarks, toggleBookmark, loading: hookLoading } = useBookmarkActions();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    // Sync local state with the source of truth from the hook
    setIsBookmarked(bookmarks.has(logId));
  }, [bookmarks, logId]);

  const handleToggle = useCallback(async () => {
    setIsToggling(true);
    // Optimistic UI update
    const newOptimisticState = !isBookmarked;
    setIsBookmarked(newOptimisticState);

    try {
      await toggleBookmark(logId, newOptimisticState);
    } catch (error) {
      // Revert on error
      setIsBookmarked(!newOptimisticState);
    } finally {
      setIsToggling(false);
    }
  }, [isBookmarked, toggleBookmark, logId]);

  const isLoading = hookLoading || isToggling;

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleToggle} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : (
        <Bookmark
          className={cn(
            "w-5 h-5 transition-all",
            isBookmarked
              ? "text-primary fill-primary/20"
              : "text-muted-foreground"
          )}
        />
      )}
    </Button>
  );
}
