// @/app/dashboard/_components/daily/daily-log-card.tsx
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
import { Card } from "@/shared/ui/card";
import { DailyLog, Account } from "@/types/domain";
import { ImageCarousel } from "./image-carousel";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

// Import the new single-responsibility action components
import { LikeButton } from "./actions/like-button";
import { CommentButton } from "./actions/comment-button";
import { BookmarkButton } from "./actions/bookmark-button";


// Internal component for displaying workspace avatar
function WorkspaceAvatar({ name }: { name: string }) {
    return (
        <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {name?.[0]?.toUpperCase() || 'W'}
            </AvatarFallback>
        </Avatar>
    )
}

// Internal component to display relative time.
function TimeAgo({ date }: { date: any }) {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        if (!date) return;
        
        const update = () => {
            import('date-fns').then(({ formatDistanceToNow }) => {
                const d = date.toDate ? date.toDate() : new Date(date);
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
      <div className="p-4 flex items-center gap-3">
        <WorkspaceAvatar name={log.workspaceName} />
        <div className="flex flex-col">
          <span className="font-bold text-sm">{log.workspaceName}</span>
          <span className="text-xs text-muted-foreground">
            by {log.author.name} • <TimeAgo date={log.createdAt} />
          </span>
        </div>
      </div>

      {/* 2. Media: Image carousel, triggers onOpen */}
      {log.photoURLs && log.photoURLs.length > 0 && (
        <div onClick={onOpen} className="aspect-square relative bg-black/5 cursor-pointer">
           <ImageCarousel images={log.photoURLs} />
        </div>
      )}

      {/* 3. Actions: Compose self-contained action components */}
      <div className="px-2 pt-2 pb-1 flex items-center justify-between">
        <div className="flex items-center">
            <LikeButton log={log} currentUser={currentUser} />
            <CommentButton onClick={onOpen} count={log.commentCount} />
        </div>
        <BookmarkButton logId={log.id} />
      </div>
      
      {/* 4. Content, triggers onOpen */}
      <div className="px-4 pb-4 cursor-pointer" onClick={onOpen}>
        <div className={'text-sm leading-relaxed line-clamp-2'}>
            <span className="font-bold mr-2">{log.author.name}</span>
            {log.content}
        </div>
      </div>
    </Card>
  );
}
