
/**
 * Shell Layout — Global UI Container
 *
 * Responsibility: Outer visual frame shared by all authenticated routes.
 * - Auth guard: redirects unauthenticated users to /login
 * - SidebarProvider: owns global sidebar open/close state
 * - Slot composition:
 *     @sidebar  → DashboardSidebar (peer element for CSS transitions)
 *     @modal    → global overlay surface (null by default)
 *     children  → authenticated route content (wraps in SidebarInset via nested layout)
 *
 * Does NOT carry business logic.
 */

"use client";

import { Fragment, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { SidebarProvider } from "@/shared/shadcn-ui/sidebar";
import { useAuth } from "@/shared/app-providers/auth-provider";
import { AccountProvider } from "@/features/workspace-core";

type ShellLayoutProps = {
  children: ReactNode;
  /** @sidebar slot — DashboardSidebar */
  sidebar: ReactNode;
  /** @modal slot — global overlay (null by default) */
  modal?: ReactNode;
};

export default function ShellLayout({ children, sidebar, modal }: ShellLayoutProps) {
  const { state } = useAuth();
  const { user, authInitialized } = state;
  const router = useRouter();

  useEffect(() => {
    if (authInitialized && !user) {
      router.push("/login");
    }
  }, [user, authInitialized, router]);

  if (!authInitialized || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-background">
        <div className="animate-bounce text-4xl">🐢</div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> Restoring dimension sovereignty...
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AccountProvider>
        <Fragment key="sidebar">{sidebar}</Fragment>
        <Fragment key="main">{children}</Fragment>
        <Fragment key="modal">{modal}</Fragment>
      </AccountProvider>
    </SidebarProvider>
  );
}
