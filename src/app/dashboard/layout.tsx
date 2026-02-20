
/**
 * Dashboard Layout Component
 * 
 * Responsibility: Main layout structure for all dashboard pages.
 * It provides the core auth guard and provider setup. The actual UI shell
 * is composed via parallel route slots (@sidebar, @header, @modal).
 *
 * Parallel route structure:
 *   @sidebar  →  DashboardSidebar  (rendered inside SidebarProvider)
 *   @header   →  Header            (rendered inside SidebarProvider via SidebarInset)
 *   @modal    →  modal overlays    (rendered inside SidebarProvider)
 */

"use client";

// ============================================================================
// External Dependencies
// ============================================================================
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// ============================================================================
// Internal Dependencies - Layout Primitives
// ============================================================================
import { SidebarProvider, SidebarInset } from "@/shared/shadcn-ui/sidebar";
import { ThemeAdapter } from "@/view-modules/dashboard/layout/theme-adapter";

// ============================================================================
// Internal Dependencies - Contexts & Providers
// ============================================================================
import { useAuth } from "@/shared/app-providers/auth-provider";
import { AccountProvider } from "@/react-providers/account-provider";

// ============================================================================
// Type Definitions
// ============================================================================

type DashboardLayoutProps = {
  children: ReactNode;
  /** @modal parallel route slot — dialog/overlay surfaces */
  modal?: ReactNode;
  /** @sidebar parallel route slot — DashboardSidebar */
  sidebar: ReactNode;
  /** @header parallel route slot — Header with SidebarTrigger + Breadcrumb */
  header: ReactNode;
};

// ============================================================================
// Component: DashboardLayoutClient
// Responsibility: Renders the authenticated layout shell using slot composition.
//
// Parallel route slot layout:
//
//   <SidebarProvider>              ← owns sidebar open/close state
//     {sidebar}                    ← @sidebar slot  (peer element for CSS transitions)
//     <SidebarInset>               ← expands when sidebar collapses
//       {header}                   ← @header slot   (SidebarTrigger lives here)
//       <main>{children}</main>
//     </SidebarInset>
//     {modal}                      ← @modal slot
//   </SidebarProvider>
//
// Both {sidebar} and {header} are rendered inside SidebarProvider so that
// useSidebar() context is available to DashboardSidebar and Header.
// ============================================================================
function DashboardLayoutClient({ children, modal, sidebar, header }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        {header}
        <ThemeAdapter>
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </ThemeAdapter>
      </SidebarInset>
      {modal}
    </SidebarProvider>
  );
}

// ============================================================================
// Component: DashboardLayout (Default Export)
// Responsibility: Auth guard and provider setup for the entire dashboard.
// ============================================================================
export default function DashboardLayout({ children, modal, sidebar, header }: DashboardLayoutProps) {
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
      <div className="h-screen w-full flex flex-col items-center justify-center space-y-4 bg-background">
        <div className="text-4xl animate-bounce">🐢</div>
        <div className="flex items-center gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
          <Loader2 className="w-3 h-3 animate-spin" /> Restoring dimension sovereignty...
        </div>
      </div>
    );
  }

  return (
    <AccountProvider>
      <DashboardLayoutClient modal={modal} sidebar={sidebar} header={header}>
        {children}
      </DashboardLayoutClient>
    </AccountProvider>
  );
}
