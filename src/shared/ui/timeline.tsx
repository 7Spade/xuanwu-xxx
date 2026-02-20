
"use client";

import * as React from "react";
import { cn } from "@/shared/utils/utils";

interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  children: React.ReactNode;
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ol
        ref={ref}
        className={cn(
          "flex w-full items-center overflow-x-auto no-scrollbar p-6",
          className
        )}
        {...props}
      >
        {children}
      </ol>
    );
  }
);
Timeline.displayName = "Timeline";

interface TimelineItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  isLast?: boolean;
  isActive?: boolean;
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, children, isLast = false, isActive = false, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("relative flex-1", className)}
        {...props}
      >
        <div className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card",
              "transition-all duration-300"
            )}
          >
            {children}
          </div>
          {!isLast && (
            <div
              className={cn(
                "h-0.5 w-full",
                isActive ? "bg-primary" : "bg-border",
                "transition-colors duration-300"
              )}
            />
          )}
        </div>
      </li>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
    side?: "top" | "bottom";
}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, side = "bottom", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-1/2 -translate-x-1/2 whitespace-nowrap pt-4 text-center",
          side === "top" ? "bottom-full pb-4 pt-0" : "top-full",
          className
        )}
        {...props}
      />
    );
  }
);
TimelineContent.displayName = "TimelineContent";


const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
});
TimelineTitle.displayName = "TimelineTitle";


const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
});
TimelineDescription.displayName = "TimelineDescription";

export {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
};
