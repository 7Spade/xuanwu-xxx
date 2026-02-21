"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn-ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/shadcn-ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/shared/shadcn-ui/sidebar"
import { Check, ChevronsUpDown, Globe, Plus } from "lucide-react"
import type { Account } from "@/shared/types"
import type { AppAction } from '../_components/app-provider'
import { cn } from "@/shared/lib"
import Link from "next/link"
import { ROUTES } from "@/shared/constants/routes"

interface AccountSwitcherProps {
  user: Account | null
  accounts: Record<string, Account>
  activeAccount: Account | null
  dispatch: React.Dispatch<AppAction>
  createOrganization: (name: string) => Promise<string>
  t: (key: string) => string
}

const getAccountInitial = (name?: string) => name?.[0] ?? ""

function AccountSwitcherItem({
  account,
  activeAccount,
  dispatch,
}: {
  account: Account
  activeAccount: Account | null
  dispatch: React.Dispatch<AppAction>
}) {
  const isUser = account.accountType === "user"
  const avatarClass = isUser ? "bg-accent/10 text-accent border-accent/20" : "bg-primary/10 text-primary border-primary/20"

  return (
    <DropdownMenuItem
      key={account.id}
      onSelect={() => dispatch({ type: "SET_ACTIVE_ACCOUNT", payload: account })}
      className="flex cursor-pointer items-center justify-between rounded-lg py-2.5"
    >
      <div className="flex items-center gap-3">
        <Avatar className={cn("w-8 h-8 border", avatarClass)}>
          {account.photoURL ? <AvatarImage src={account.photoURL} alt={account.name} /> : null}
          <AvatarFallback className={cn("font-bold text-xs", avatarClass)}>
            {getAccountInitial(account.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-xs font-bold">{account.name}</span>
        </div>
      </div>
      {activeAccount?.id === account.id && <Check className="size-4 text-primary" />}
    </DropdownMenuItem>
  )
}

export function AccountSwitcher({
  user,
  accounts,
  activeAccount,
  dispatch,
  createOrganization: _createOrganization,
  t,
}: AccountSwitcherProps) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const availableAccounts = useMemo(() => {
    if (!user) return []
    const personalAccount: Account = { ...user, name: `${user.name} (Personal)` }
    return [personalAccount, ...Object.values(accounts)]
  }, [user, accounts])

  const accountLabel = activeAccount?.name ?? t('sidebar.selectAccount')

  return (
    <>
      <Link href={ROUTES.DASHBOARD} className="mb-2 flex items-center px-1 transition-opacity hover:opacity-80">
        <div className="select-none text-3xl">🐢</div>
      </Link>

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {activeAccount ? (
                  <Avatar className="size-8 rounded-lg">
                    {activeAccount.accountType === 'user' && user?.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={activeAccount.name} />
                    ) : null}
                    <AvatarFallback className={cn("rounded-lg font-bold text-xs", activeAccount.accountType === "user" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary")}>
                      {getAccountInitial(activeAccount.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Globe className="size-4" />
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{accountLabel}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {activeAccount?.accountType === 'organization' ? 'Organization' : 'Personal'}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t('sidebar.switchAccountContext')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableAccounts.map((account) => (
                <AccountSwitcherItem key={account.id} account={account} activeAccount={activeAccount} dispatch={dispatch} />
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary"
                onSelect={() => {
                  setIsDropdownOpen(false)
                  router.push(ROUTES.ACCOUNT_NEW)
                }}
              >
                <Plus className="size-4" /> {t('sidebar.createNewDimension')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
