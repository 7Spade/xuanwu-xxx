
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from "@/shared/shadcn-ui/button";
import { SidebarTrigger } from "@/shared/shadcn-ui/sidebar";
import { Separator } from "@/shared/shadcn-ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/shadcn-ui/breadcrumb";
import { Search, Command } from "lucide-react";
import { NotificationCenter } from "./notification-center";
import { GlobalSearch } from "./global-search";
import { useApp } from "@/features/workspace-core";
import type { Account } from '@/shared/types'
import { useVisibleWorkspaces } from '../_hooks/use-visible-workspaces';
import Link from 'next/link';

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  workspaces: 'Workspaces',
  account: 'Account',
  members: 'Members',
  teams: 'Teams',
  partners: 'Partners',
  settings: 'Settings',
  matrix: 'Matrix',
  schedule: 'Schedule',
  daily: 'Daily',
  audit: 'Audit',
  new: 'New',
};

function usePageBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));
}

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { state: appState, dispatch } = useApp();
  const pathname = usePathname();

  const { accounts, notifications, activeAccount } = appState
  
  const visibleWorkspaces = useVisibleWorkspaces()
  const breadcrumbs = usePageBreadcrumbs(pathname);

  const organizationsArray: Account[] = Object.values(accounts).filter(a => a.accountType === 'organization')
  const activeOrganization = activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null
  const activeOrganizationMembers = activeOrganization?.members ?? []

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSwitchOrganization = (organization: Account) => {
      dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: organization })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/60 backdrop-blur-md transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.flatMap((crumb) =>
              crumb.isLast ? [
                <BreadcrumbItem key={crumb.href}>
                  <BreadcrumbPage className="font-semibold capitalize">{crumb.label}</BreadcrumbPage>
                </BreadcrumbItem>,
              ] : [
                <BreadcrumbItem key={crumb.href} className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href} className="capitalize">{crumb.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>,
                <BreadcrumbSeparator key={`sep-${crumb.href}`} className="hidden md:block" />,
              ]
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <Button
          variant="outline"
          className="group relative h-9 w-full max-w-md justify-start border-none bg-muted/40 text-sm text-muted-foreground"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" />
          <span className="pl-7">Search dimensions, spaces, or people...</span>
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <div className="ml-1 hidden items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground shadow-sm md:flex">
              <Command className="size-2.5" /> K
            </div>
          </div>
        </Button>
      </div>
      <div className="flex items-center gap-3 pr-4">
        <NotificationCenter notifications={notifications} dispatch={dispatch} />
      </div>
      <GlobalSearch
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        organizations={organizationsArray}
        workspaces={visibleWorkspaces}
        members={activeOrganizationMembers}
        activeOrganizationId={activeOrganization?.id || null}
        onSwitchOrganization={handleSwitchOrganization}
      />
    </header>
  );
}
