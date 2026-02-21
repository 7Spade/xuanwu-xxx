
"use client";

import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/shared/shadcn-ui/sidebar";
import { Terminal } from "lucide-react";
import type { Workspace } from "@/shared/types";

interface NavWorkspacesProps {
  workspaces: Workspace[];
  pathname: string;
  t: (key: string) => string;
}

export function NavWorkspaces({ workspaces, pathname, t }: NavWorkspacesProps) {
  if (workspaces.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
        {t('sidebar.quickAccess')}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {workspaces.map((workspace) => (
            <SidebarMenuItem key={workspace.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname === `/dashboard/workspaces/${workspace.id}`}
              >
                <Link href={`/dashboard/workspaces/${workspace.id}`}>
                  <Terminal className="w-3 h-3 text-primary/60" />
                  <span className="truncate text-xs font-medium">{workspace.name}</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuBadge className="text-[8px] uppercase">
                {workspace.id.slice(-3).toUpperCase()}
              </SidebarMenuBadge>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
