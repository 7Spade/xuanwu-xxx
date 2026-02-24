"use client";

import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  children?: ReactNode;
}

/**
 * PageHeader — shared page-level heading component.
 * Used across all dashboard views for a consistent title/description/action layout.
 */
export function PageHeader({ title, description, badge, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="space-y-1">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="font-headline text-4xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
