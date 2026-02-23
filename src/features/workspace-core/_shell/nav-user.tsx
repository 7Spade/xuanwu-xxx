"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/shadcn-ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn-ui/avatar"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/shared/shadcn-ui/sidebar"
import { UserCircle, LogOut, ChevronsUpDown } from "lucide-react"
import type { Account } from "@/shared/types"
import { useMemo } from "react"
import { ROUTES } from "@/shared/constants/routes"

interface NavUserProps {
  user: Account | null
  accounts: Record<string, Account>
  activeAccount: Account | null
  logout: () => void
  t: (key: string, params?: Record<string, string | number>) => string;
}

const getAccountInitial = (name?: string) => name?.[0] ?? ""

export function NavUser({ user, accounts, activeAccount, logout, t }: NavUserProps) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push(ROUTES.LOGIN)
  }

  const activeOrganization = useMemo(() =>
    activeAccount?.accountType === "organization" ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  )

  const currentUserRoleInOrganization = useMemo(() => {
    if (!activeOrganization || !user) return null
    if (activeOrganization.ownerId === user.id) return t('sidebar.owner')
    const member = activeOrganization.members?.find((m) => m.id === user.id)
    return member?.role || t('sidebar.guest')
  }, [activeOrganization, user, t])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                {user?.photoURL ? <AvatarImage src={user.photoURL} alt={user?.name} /> : null}
                <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">{getAccountInitial(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeAccount?.accountType === 'organization' ? currentUserRoleInOrganization : user?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              {t('navigation.account')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.ACCOUNT_SETTINGS} className="flex cursor-pointer items-center gap-2 py-2">
                <UserCircle className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium">{t('sidebar.userSettings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex cursor-pointer items-center gap-2 py-2 text-destructive">
              <LogOut className="size-4" />
              <span className="text-xs font-bold">{t('auth.disconnect')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
