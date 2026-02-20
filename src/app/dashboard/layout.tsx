
/**
 * Dashboard Layout Component
 * 
 * Responsibility: Main layout structure for all dashboard pages.
 * It provides the core auth guard and provider setup. The actual UI shell
 * is now composed of smaller, single-responsibility components.
 */

"use client";

// ============================================================================
// External Dependencies
// ============================================================================
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// ============================================================================
// Internal Dependencies - Components & Layout
// ============================================================================
import { SidebarProvider, SidebarInset } from "@/shared/shadcn-ui/sidebar";
import { DashboardSidebar } from "@/app/dashboard/_components/sidebar";
import { Header } from "@/app/dashboard/_components/layout/header";
import { ThemeAdapter } from "@/app/dashboard/_components/layout/theme-adapter";

// ============================================================================
// Internal Dependencies - Contexts & Providers
// ============================================================================
import { useAuth } from "@/shared/context/auth-context";
import { AccountProvider } from "@/context/account-context";

// ============================================================================
// Type Definitions
// ============================================================================

type DashboardLayoutProps = {
  children: ReactNode;
  modal?: ReactNode;
};

// ============================================================================
// Component: DashboardLayoutClient
// Responsibility: Renders the authenticated layout shell.
// ============================================================================
function DashboardLayoutClient({ children, modal }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <Header />
        <ThemeAdapter>
            <main className="flex-1 p-6 overflow-y-auto content-visibility-auto">
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
export default function DashboardLayout({ children, modal }: DashboardLayoutProps) {
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
      <DashboardLayoutClient modal={modal}>{children}</DashboardLayoutClient>
    </AccountProvider>
  );
}
