
"use client";

import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/shared/shadcn-ui/sidebar";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Terminal } from "lucide-react";
import { Workspace } from "@/domain-types/domain";

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
                  <Badge variant="outline" className="ml-auto text-[8px] h-3.5 px-1 uppercase">
                    {workspace.id.slice(-3).toUpperCase()}
                  </Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
