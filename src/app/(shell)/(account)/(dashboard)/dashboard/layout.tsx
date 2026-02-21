
/**
 * Dashboard Layout
 *
 * Responsibility: Business layout for authenticated dashboard pages.
 * Auth guard and SidebarProvider live in (shell)/layout.tsx.
 * AccountProvider lives in the parent (account)/layout.tsx.
 *
 * Parallel route structure:
 *   @header  →  Header (SidebarTrigger + Breadcrumb, inside SidebarInset)
 *   @modal   →  route-specific dialog/overlay interceptions
 */

"use client";

import type { ReactNode } from "react";

import { SidebarInset } from "@/shared/shadcn-ui/sidebar";
import { ThemeAdapter } from "@/features/workspace-core";

type DashboardLayoutProps = {
  children: ReactNode;
  /** @header parallel route slot — Header with SidebarTrigger + Breadcrumb */
  header: ReactNode;
  /** @modal parallel route slot — route-specific dialog/overlay surfaces */
  modal?: ReactNode;
};

export default function DashboardLayout({ children, header, modal }: DashboardLayoutProps) {
  return (
    <SidebarInset>
      {header}
      <ThemeAdapter>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </ThemeAdapter>
      {modal}
    </SidebarInset>
  );
}
