
"use client"

import { useMemo } from 'react'
import { useApp } from './use-app'
import { useAuth } from '@/shared/app-providers/auth-provider'
import { useAccount } from './use-account'
import { filterVisibleWorkspaces } from '@/shared/lib'

/**
 * A hook that centralizes the logic for determining which workspaces are visible to the current user
 * based on the active account context.
 *
 * @returns A memoized array of `Workspace` objects that the current user is allowed to see in the active dimension.
 */
export function useVisibleWorkspaces() {
  const { state: appState } = useApp()
  const { state: accountState } = useAccount()
  const { state: authState } = useAuth()

  const { user } = authState
  const { accounts, activeAccount } = appState
  const { workspaces } = accountState

  const visibleWorkspaces = useMemo(() => {
    if (!activeAccount || !user || !workspaces) return []
    return filterVisibleWorkspaces(
      Object.values(workspaces),
      user.id,
      activeAccount,
      accounts
    )
  }, [workspaces, activeAccount, accounts, user])

  return visibleWorkspaces
}
