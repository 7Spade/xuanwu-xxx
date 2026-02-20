
"use client";

import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/shadcn-ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuButton,
} from "@/shared/shadcn-ui/sidebar";
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  ChevronRight,
  Users,
  Globe,
  Settings,
  Grid3X3,
  Calendar,
  MessageSquare,
  History
} from "lucide-react";
import { cn } from "@/shared/utils/utils";

interface NavMainProps {
  pathname: string;
  isOrganizationAccount: boolean;
  t: (key: string) => string;
}

export function NavMain({ pathname, isOrganizationAccount, t }: NavMainProps) {
  
  const isActive = (path: string) => pathname === path;
  const isPartiallyActive = (path: string) => pathname.startsWith(path);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
          <Link href="/dashboard">
            <LayoutDashboard />
            <span className="font-semibold">{t("navigation.dashboard")}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isPartiallyActive("/dashboard/workspaces")}>
          <Link href="/dashboard/workspaces">
            <Layers />
            <span className="font-semibold">{t("navigation.workspaces")}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isOrganizationAccount && (
        <SidebarMenuItem>
          <Collapsible defaultOpen className="group/collapsible w-full">
            <SidebarMenuButton asChild>
                <CollapsibleTrigger>
                  <FolderTree />
                  <span className="font-semibold">{t("sidebar.accountGovernance")}</span>
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
            </SidebarMenuButton>
            <CollapsibleContent>
              <SidebarMenuSub>
                {[
                  { path: "/dashboard/account/members", icon: Users, label: t('navigation.members') },
                  { path: "/dashboard/account/teams", icon: Users, label: t('navigation.internalTeams') },
                  { path: "/dashboard/account/partners", icon: Globe, label: t('navigation.partnerTeams') },
                  { path: "/dashboard/account/settings", icon: Settings, label: t('navigation.settings') },
                  { path: "/dashboard/account/matrix", icon: Grid3X3, label: t('navigation.permissions') },
                  { path: "/dashboard/account/schedule", icon: Calendar, label: t('navigation.schedule') },
                  { path: "/dashboard/account/daily", icon: MessageSquare, label: t('navigation.daily') },
                  { path: "/dashboard/account/audit", icon: History, label: t('navigation.audit') },
                ].map((item) => (
                  <SidebarMenuSubItem key={item.path}>
                    <SidebarMenuSubButton asChild isActive={isPartiallyActive(item.path)}>
                      <Link href={item.path} className="flex items-center gap-2">
                        <item.icon className="w-3 h-3" /> {item.label}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
