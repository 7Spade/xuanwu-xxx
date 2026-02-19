
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
} from "@/app/_components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/app/_components/ui/sidebar"
import { UserCircle, LogOut, ChevronUp } from "lucide-react"
import { Account } from "@/types/domain"
import { useMemo } from "react"

interface NavUserProps {
  user: Account | null
  accounts: Record<string, Account>
  activeAccount: Account | null
  logout: () => void
  t: (key: string) => void
}

const getAccountInitial = (name?: string) => name?.[0] ?? ""

export function NavUser({ user, accounts, activeAccount, logout, t }: NavUserProps) {
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const activeOrg = useMemo(() =>
    activeAccount?.accountType === "organization" && activeAccount
      ? accounts[activeAccount.id]
      : null,
    [accounts, activeAccount]
  )

  const currentUserRoleInOrg = useMemo(() => {
    if (!activeOrg || !user) return null
    if (activeOrg.ownerId === user.id) return t('sidebar.owner')
    const member = activeOrg.members?.find((m) => m.id === user.id)
    return member?.role || t('sidebar.guest')
  }, [activeOrg, user, t])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="w-full hover:bg-primary/5">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                    {user?.photoURL ? <AvatarImage src={user.photoURL} alt={user?.name} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{getAccountInitial(user?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden text-left flex-1">
                    <span className="text-xs font-bold truncate">{user?.name}</span>
                    <span className="text-[9px] text-muted-foreground truncate uppercase">
                      {activeAccount?.accountType === 'organization' ? currentUserRoleInOrg : user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto w-4 h-4 text-muted-foreground opacity-50" />
                </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-[220px]">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              {t('navigation.account')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/account/settings" className="cursor-pointer flex items-center gap-2 py-2">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium">{t('sidebar.userSettings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer flex items-center gap-2 py-2">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold">{t('auth.disconnect')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
