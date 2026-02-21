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
import { ROUTES } from "@/shared/constants/routes";

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
        <SidebarMenuButton asChild isActive={isActive(ROUTES.DASHBOARD)}>
          <Link href={ROUTES.DASHBOARD}>
            <LayoutDashboard />
            <span className="font-semibold">{t("navigation.dashboard")}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isPartiallyActive(ROUTES.WORKSPACES)}>
          <Link href={ROUTES.WORKSPACES}>
            <Layers />
            <span className="font-semibold">{t("navigation.workspaces")}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isOrganizationAccount && (
        <Collapsible asChild defaultOpen className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <FolderTree />
                <span className="font-semibold">{t("sidebar.accountGovernance")}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {[
                  { path: ROUTES.ACCOUNT_MEMBERS, icon: Users, label: t('navigation.members') },
                  { path: ROUTES.ACCOUNT_TEAMS, icon: Users, label: t('navigation.internalTeams') },
                  { path: ROUTES.ACCOUNT_PARTNERS, icon: Globe, label: t('navigation.partnerTeams') },
                  { path: ROUTES.ACCOUNT_SETTINGS, icon: Settings, label: t('navigation.settings') },
                  { path: ROUTES.ACCOUNT_MATRIX, icon: Grid3X3, label: t('navigation.permissions') },
                  { path: ROUTES.ACCOUNT_SCHEDULE, icon: Calendar, label: t('navigation.schedule') },
                  { path: ROUTES.ACCOUNT_DAILY, icon: MessageSquare, label: t('navigation.daily') },
                  { path: ROUTES.ACCOUNT_AUDIT, icon: History, label: t('navigation.audit') },
                ].map((item) => (
                  <SidebarMenuSubItem key={item.path}>
                    <SidebarMenuSubButton asChild isActive={isPartiallyActive(item.path)}>
                      <Link href={item.path} className="flex items-center gap-2">
                        <item.icon className="size-3" /> {item.label}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )}
    </SidebarMenu>
  );
}
