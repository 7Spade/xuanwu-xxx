// @/features/workspace-business.daily/_components/daily-log-card.tsx
/**
 * @fileoverview DailyLogCard - The preview card for a single daily log entry.
 * @description This is a "dumb component" responsible for the visual representation
 * of a log. It composes independent, single-responsibility action components.
 *
 * @responsibility
 * - Renders author info, image carousel, and truncated content.
 * - Composes and renders action buttons from the `actions/` directory.
 * - Triggers `onOpen` when the main card body is clicked.
 */
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/shadcn-ui/card";
import { type DailyLog, type Account } from "@/shared/types";
import type { Timestamp } from "firebase/firestore";
import { ImageCarousel } from "./image-carousel";
import { Avatar, AvatarFallback } from "@/shared/shadcn-ui/avatar";

// Import the new single-responsibility action components
import { LikeButton } from "./actions/like-button";
import { CommentButton } from "./actions/comment-button";
import { BookmarkButton } from "./actions/bookmark-button";


// Internal component for displaying workspace avatar
function WorkspaceAvatar({ name }: { name: string }) {
    return (
        <Avatar className="size-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                {name?.[0]?.toUpperCase() || 'W'}
            </AvatarFallback>
        </Avatar>
    )
}

// Internal component to display relative time.
function TimeAgo({ date }: { date: Timestamp | Date | null | undefined }) {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        if (!date) return;
        
        const update = () => {
            import('date-fns').then(({ formatDistanceToNow }) => {
                const d = date instanceof Date ? date : date.toDate();
                setTimeAgo(formatDistanceToNow(d, { addSuffix: true }));
            });
        };
        
        update();
        const intervalId = setInterval(update, 60000); // Update every minute
        return () => clearInterval(intervalId);

    }, [date]);

    return (
        <span suppressHydrationWarning>
            {timeAgo || 'Syncing...'}
        </span>
    );
}

interface DailyLogCardProps {
  log: DailyLog;
  currentUser: Account | null;
  onOpen: () => void;
}

export function DailyLogCard({ log, currentUser, onOpen }: DailyLogCardProps) {

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm transition-all duration-300">
      {/* 1. Header: Workspace and author info */}
      <div className="flex items-center gap-3 p-4">
        <WorkspaceAvatar name={log.workspaceName} />
        <div className="flex flex-col">
          <span className="text-sm font-bold">{log.workspaceName}</span>
          <span className="text-xs text-muted-foreground">
            by {log.author.name} • <TimeAgo date={log.createdAt} />
          </span>
        </div>
      </div>

      {/* 2. Media: Image carousel, triggers onOpen */}
      {log.photoURLs && log.photoURLs.length > 0 && (
        <button type="button" onClick={onOpen} className="relative aspect-square w-full cursor-pointer bg-black/5">
           <ImageCarousel images={log.photoURLs} />
        </button>
      )}

      {/* 3. Actions: Compose self-contained action components */}
      <div className="flex items-center justify-between px-2 pb-1 pt-2">
        <div className="flex items-center">
            <LikeButton log={log} currentUser={currentUser} />
            <CommentButton onClick={onOpen} count={log.commentCount} />
        </div>
        <BookmarkButton logId={log.id} />
      </div>
      
      {/* 4. Content, triggers onOpen */}
      <button type="button" className="w-full cursor-pointer px-4 pb-4 text-left" onClick={onOpen}>
        <div className={'line-clamp-2 text-sm leading-relaxed'}>
            <span className="mr-2 font-bold">{log.author.name}</span>
            {log.content}
        </div>
      </button>
    </Card>
  );
}
