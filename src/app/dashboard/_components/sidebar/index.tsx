
/**
 * @fileoverview Dashboard Sidebar - Main Assembly Component
 *
 * @description This component acts as the "smart container" for the entire dashboard sidebar.
 * Its primary responsibility is to:
 * 1. Fetch all necessary application state from various contexts and hooks.
 * 2. Assemble the sidebar's visual structure using the core `<Sidebar>` UI components.
 * 3. Pass the fetched state and required functions down as props to its "dumb" child components.
 * This pattern ensures a clean separation of concerns and a clear, top-down data flow.
 */

"use client";

// ============================================================================
// Next.js & React Imports
// ============================================================================
import { usePathname } from 'next/navigation';

// ============================================================================
// UI Components
// ============================================================================
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/app/_components/ui/sidebar";

// ============================================================================
// Contexts & Hooks
// ============================================================================
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import { useApp } from "@/hooks/state/use-app";
import { useUser } from "@/hooks/state/use-user";
import { useVisibleWorkspaces } from "@/hooks/state/use-visible-workspaces";
import { useOrganization } from "@/hooks/state/use-organization";

// ============================================================================
// Sidebar Sub-components
// ============================================================================
import { AccountSwitcher } from "./account-switcher";
import { NavMain } from "./nav-main";
import { NavWorkspaces } from "./nav-workspaces";
import { NavUser } from "./nav-user";

/**
 * The main sidebar component for the dashboard. It composes various
 * sub-components to build the complete, interactive sidebar.
 */
export function DashboardSidebar() {
  const { t } = useI18n();
  const pathname = usePathname();

  // ========================================
  // State Management - Data Fetching from Hooks
  // ========================================
  const { state: authState, logout } = useAuth();
  const { user } = authState;
  const { profile: userProfile } = useUser();
  const { state: appState, dispatch } = useApp();
  const { organizations, activeAccount } = appState;
  const visibleWorkspaces = useVisibleWorkspaces();
  const { createOrganization } = useOrganization();

  // ========================================
  // Render - Assembling the Sidebar
  // ========================================
  return (
    <Sidebar className="border-r border-border/50">
      {/* Sidebar Header: Contains the logo and the account switcher dropdown */}
      <SidebarHeader className="p-4">
        <AccountSwitcher
          user={user}
          userProfile={userProfile}
          organizations={organizations}
          activeAccount={activeAccount}
          dispatch={dispatch}
          createOrganization={createOrganization}
          t={t}
        />
      </SidebarHeader>

      {/* Sidebar Content: Contains the main navigation and workspace quick links */}
      <SidebarContent>
        {/* Main navigation section for core dashboard areas */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 px-3">
            {t('sidebar.dimensionCore')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain
              pathname={pathname}
              isOrganizationAccount={activeAccount?.type === "organization"}
              t={t}
            />
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator className="mx-4 opacity-50" />
        
        {/* Quick access section for visible workspaces */}
        <NavWorkspaces
          workspaces={visibleWorkspaces}
          pathname={pathname}
          t={t}
        />
      </SidebarContent>

      {/* Sidebar Footer: Contains user profile info, settings, and logout */}
      <SidebarFooter className="p-4 bg-muted/5">
        <NavUser
          user={user}
          userProfile={userProfile}
          organizations={organizations}
          activeAccount={activeAccount}
          logout={logout}
          t={t}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
