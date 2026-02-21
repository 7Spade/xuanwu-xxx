/**
 * @fileoverview comment-button.tsx - A functional component for the "comment" action.
 * @description This component displays the comment count and triggers an action when clicked.
 */
"use client";

import { Button } from "@/shared/shadcn-ui/button";
import { MessageCircle } from "lucide-react";

interface CommentButtonProps {
  count?: number;
  onClick: () => void;
}

export function CommentButton({ count = 0, onClick }: CommentButtonProps) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="size-9" onClick={onClick}>
        <MessageCircle className="size-5 text-muted-foreground" />
      </Button>
      {count > 0 && (
         <span className="pr-2 text-xs font-bold text-muted-foreground">{count}</span>
      )}
    </div>
  );
}
