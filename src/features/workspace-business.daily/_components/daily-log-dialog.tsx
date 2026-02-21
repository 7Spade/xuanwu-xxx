// @/features/workspace-business.daily/_components/daily-log-dialog.tsx
/**
 * @fileoverview Daily Log Dialog - The detailed view for a single log entry.
 * @description This component displays a single daily log in a modal dialog.
 * It composes independent, single-responsibility action components for user interactions.
 *
 * @responsibility
 * - Renders a large, focused view of a single `DailyLog`.
 * - Provides space for detailed content and all images.
 * - Composes and renders action buttons from the `actions/` directory.
 * - Manages its own open/close state.
 */
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/shadcn-ui/dialog";
import { type DailyLog, type DailyLogComment, type Account } from "@/shared/types";
import type { Timestamp } from "firebase/firestore";
import { ImageCarousel } from "./image-carousel";
import { Avatar, AvatarFallback } from "@/shared/shadcn-ui/avatar";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { LikeButton } from './actions/like-button';
import { CommentButton } from './actions/comment-button';
import { BookmarkButton } from "./actions/bookmark-button";
import { ShareButton } from './actions/share-button';
import { useFirebase } from "@/shared/app-providers/firebase-provider";
import { useAuth } from "@/shared/app-providers/auth-provider";
import { addDailyLogComment } from "../_actions";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { toast } from "@/shared/utility-hooks/use-toast";
import { Textarea } from "@/shared/shadcn-ui/textarea";
import { Button } from "@/shared/shadcn-ui/button";
import { CornerUpLeft, Loader2 } from "lucide-react";

interface DailyLogDialogProps {
  log: DailyLog | null;
  currentUser: Account | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

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

export function DailyLogDialog({ log, currentUser, isOpen, onOpenChange }: DailyLogDialogProps) {
  const { db } = useFirebase();
  const { state: authState } = useAuth();
  const [comments, setComments] = useState<DailyLogComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (!isOpen || !log || !db) {
        setComments([]);
        return;
    }

    const commentsQuery = query(
        collection(db, `accounts/${log.accountId}/dailyLogs/${log.id}/comments`),
        orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyLogComment));
        setComments(fetchedComments);
    });

    return () => unsubscribe();

  }, [isOpen, log, db]);

  const handlePostComment = async () => {
      if (!newComment.trim() || !log || !authState.user) return;
      setIsPosting(true);
      try {
          await addDailyLogComment(
              log.accountId,
              log.id,
              { uid: authState.user.id, name: authState.user.name || "Anonymous", avatarUrl: authState.user.photoURL || "" },
              newComment
          );
          setNewComment("");
      } catch (error) {
          console.error("Failed to post comment:", error);
          toast({ variant: 'destructive', title: 'Failed to post comment' });
      } finally {
          setIsPosting(false);
      }
  };
  
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[90vh] w-full max-w-4xl grid-cols-1 gap-0 p-0 md:grid-cols-2">
        
        {/* Image Section */}
        <div className="relative order-1 aspect-square bg-muted md:order-2 md:aspect-auto">
            {log.photoURLs && log.photoURLs.length > 0 && <ImageCarousel images={log.photoURLs} />}
        </div>
        
        {/* Content Section */}
        <div className="order-2 flex h-full max-h-[90vh] flex-col md:order-1">
            {/* Header */}
            <DialogHeader className="flex-row items-center justify-between space-y-0 border-b p-4">
                <div className="flex items-center gap-3">
                    <WorkspaceAvatar name={log.workspaceName} />
                    <div className="flex flex-col text-left">
                      <DialogTitle className="text-sm font-bold">{log.workspaceName}</DialogTitle>
                      <span className="text-xs text-muted-foreground">
                        by {log.author.name} • <TimeAgo date={log.createdAt} />
                      </span>
                    </div>
                </div>
                 <ShareButton log={log} />
            </DialogHeader>
            
            {/* Content & Comments Body */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                <p className="mb-6 whitespace-pre-wrap border-b pb-6 text-sm leading-relaxed">
                    <span className="mr-2 font-bold">{log.author.name}</span>
                    {log.content}
                </p>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                       <Avatar className="size-8 border-2 border-primary/10">
                          <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary">{comment.author.name?.[0]}</AvatarFallback>
                       </Avatar>
                       <div className="flex-1">
                          <p className="text-xs leading-relaxed">
                            <span className="mr-2 font-bold">{comment.author.name}</span>
                            {comment.content}
                          </p>
                          <TimeAgo date={comment.createdAt} />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
            
            {/* Actions & Comment Input Footer */}
            <div className="mt-auto space-y-2 border-t p-2">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center">
                        <LikeButton log={log} currentUser={currentUser} />
                        <CommentButton onClick={() => {}} count={log.commentCount} />
                    </div>
                    <BookmarkButton logId={log.id} />
                </div>
                <div className="flex items-center gap-2 p-2">
                  <Textarea 
                    placeholder="Add a comment..." 
                    className="flex-1 resize-none rounded-lg border-border/50 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary"
                    rows={1}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button size="icon" className="size-9 rounded-lg" onClick={handlePostComment} disabled={isPosting || !newComment.trim()}>
                    {isPosting ? <Loader2 className="size-4 animate-spin"/> : <CornerUpLeft className="size-4" />}
                  </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
