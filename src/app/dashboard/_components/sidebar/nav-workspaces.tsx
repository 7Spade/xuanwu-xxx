
"use client";

import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/shared/shadcn-ui/sidebar";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Terminal } from "lucide-react";
import { Workspace } from "@/types/domain";
import { cn } from "@/shared/utils/utils";

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
              <Link
                href={`/dashboard/workspaces/${workspace.id}`}
                className={cn(
                  "peer/menu-button flex w-full items-center justify-between gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2",
                  pathname === `/dashboard/workspaces/${workspace.id}` && "bg-primary/10 text-primary font-semibold"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Terminal className="w-3 h-3 text-primary/60" />
                  <span className="truncate text-xs font-medium">{workspace.name}</span>
                </div>
                <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase">
                  {workspace.id.slice(-3).toUpperCase()}
                </Badge>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
