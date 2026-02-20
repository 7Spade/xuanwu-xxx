
"use client"

import { useMemo, useState } from "react"
import { Button } from "@/shared/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Check, ChevronsUpDown, Globe, Plus } from "lucide-react"
import { Account } from "@/types/domain"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AccountCreateDialog } from "./account-create-dialog"

interface AccountSwitcherProps {
  user: Account | null
  accounts: Record<string, Account>
  activeAccount: Account | null
  dispatch: React.Dispatch<any>
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
  dispatch: React.Dispatch<any>
}) {
  const isUser = account.accountType === "user"
  const avatarClass = isUser ? "bg-accent/10 text-accent border-accent/20" : "bg-primary/10 text-primary border-primary/20"

  return (
    <DropdownMenuItem
      key={account.id}
      onSelect={() => dispatch({ type: "SET_ACTIVE_ACCOUNT", payload: account })}
      className="flex items-center justify-between cursor-pointer py-2.5 rounded-lg"
    >
      <div className="flex items-center gap-3">
        <Avatar className={cn("w-8 h-8 border", avatarClass)}>
          {account.photoURL ? <AvatarImage src={account.photoURL} alt={account.name} /> : null}
          <AvatarFallback className={cn("font-bold text-xs", avatarClass)}>
            {getAccountInitial(account.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-bold text-xs">{account.name}</span>
        </div>
      </div>
      {activeAccount?.id === account.id && <Check className="w-4 h-4 text-primary" />}
    </DropdownMenuItem>
  )
}

export function AccountSwitcher({
  user,
  accounts,
  activeAccount,
  dispatch,
  createOrganization,
  t,
}: AccountSwitcherProps) {
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const availableAccounts = useMemo(() => {
    if (!user) return []
    const personalAccount: Account = { ...user, name: `${user.name} (Personal)` }
    return [personalAccount, ...Object.values(accounts)]
  }, [user, accounts])

  const accountLabel = activeAccount?.name ?? t('sidebar.selectAccount')

  return (
    <>
      <Link href="/dashboard" className="flex items-center mb-4 px-1 hover:opacity-80 transition-opacity">
        <div className="text-3xl select-none">🐢</div>
      </Link>
      
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between shadow-sm border-border/60 hover:bg-accent/10 rounded-xl h-11">
            <div className="flex items-center gap-3 truncate">
              {activeAccount ? (
                <Avatar className="w-6 h-6">
                  {activeAccount.accountType === 'user' && user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={activeAccount.name} />
                  ) : null}
                  <AvatarFallback className={cn("font-bold text-xs shadow-inner", activeAccount.accountType === "user" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary")}>
                    {getAccountInitial(activeAccount.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span className="truncate font-semibold text-sm">{accountLabel}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]" align="start">
          <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest font-black px-2 py-1.5">
            {t('sidebar.switchAccountContext')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableAccounts.map((account) => <AccountSwitcherItem key={account.id} account={account} activeAccount={activeAccount} dispatch={dispatch} />)}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer py-2.5 text-primary font-black uppercase text-[10px] tracking-widest"
            onSelect={() => {
              setIsDropdownOpen(false);
              setTimeout(() => setIsCreateOrgOpen(true), 150);
            }}
          >
            <Plus className="w-4 h-4" /> {t('sidebar.createNewDimension')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountCreateDialog
        open={isCreateOrgOpen}
        onOpenChange={setIsCreateOrgOpen}
        createOrganization={createOrganization}
        dispatch={dispatch}
        accounts={accounts}
        t={t}
      />
    </>
  )
}
