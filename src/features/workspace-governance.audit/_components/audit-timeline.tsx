// [職責] 基於 shadcn/ui timeline 的封裝，作為審計事件的容器
"use client";

import type * as React from "react";
import { cn } from "@/shared/lib";

interface AuditTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AuditTimeline({ children, className }: AuditTimelineProps) {
  return (
    <div className={cn("relative space-y-8", className)}>
      <div
        className="absolute inset-y-2 left-3 w-px bg-border"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

interface AuditEventItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AuditEventItemContainer({ children, className }: AuditEventItemProps) {
  return (
    <div className={cn("relative flex items-start gap-4", className)}>
      {children}
    </div>
  );
}
