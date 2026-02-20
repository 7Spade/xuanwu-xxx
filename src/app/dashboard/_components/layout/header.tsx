
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/shared/ui/button";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Search, Command } from "lucide-react";
import { NotificationCenter } from "./notification-center";
import { GlobalSearch } from "./global-search";
import { useApp } from "@/hooks/state/use-app";
import { useAccount } from "@/hooks/state/use-account";
import { Account } from '@/types/domain'
import { useVisibleWorkspaces } from '@/hooks/state/use-visible-workspaces';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { state: appState, dispatch } = useApp();

  const { accounts, notifications, activeAccount } = appState
  
  const visibleWorkspaces = useVisibleWorkspaces()

  const organizationsArray: Account[] = Object.values(accounts).filter(a => a.accountType === 'organization')
  const activeOrg = activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null
  const activeOrgMembers = activeOrg?.members ?? []

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

  const handleSwitchOrg = (org: Account) => {
      dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: org })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/60 backdrop-blur-md px-6">
      <SidebarTrigger />
      <div className="flex-1 flex items-center justify-center">
        <Button
          variant="outline"
          className="relative w-full max-w-md justify-start text-sm text-muted-foreground bg-muted/40 border-none h-9 group"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="pl-7">Search dimensions, spaces, or people...</span>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <div className="hidden md:flex items-center gap-1 text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 bg-background shadow-sm ml-1">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <NotificationCenter notifications={notifications} dispatch={dispatch} />
      </div>
      <GlobalSearch
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        organizations={organizationsArray}
        workspaces={visibleWorkspaces}
        members={activeOrgMembers}
        activeOrgId={activeOrg?.id || null}
        onSwitchOrg={handleSwitchOrg}
      />
    </header>
  );
}
