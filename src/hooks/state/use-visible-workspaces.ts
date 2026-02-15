
"use client";

import { useMemo } from 'react';
import { Workspace } from '@/types/domain';
import { useApp } from './use-app';
import { useAuth } from '@/context/auth-context';
import { useAccount } from './use-account';

/**
 * A hook that centralizes the logic for determining which workspaces are visible to the current user
 * based on the active account context.
 *
 * @returns A memoized array of `Workspace` objects that the current user is allowed to see in the active dimension.
 */
export function useVisibleWorkspaces() {
  const { state: appState } = useApp();
  const { state: accountState } = useAccount();
  const { state: authState } = useAuth();
  
  const { user } = authState;
  const { organizations, activeAccount } = appState;
  const { workspaces } = accountState;

  const visibleWorkspaces = useMemo(() => {
    if (!activeAccount || !user || !workspaces) return [];

    // Filter workspaces that belong to the active dimension.
    const accountWorkspaces = Object.values(workspaces).filter((workspace: Workspace) => {
      return workspace.dimensionId === activeAccount.id;
    });

    // If the active account is a user's personal account, they see all their own workspaces.
    if (activeAccount.type === 'user') {
      return accountWorkspaces;
    }
    
    // If the active account is an organization, apply visibility logic.
    if (activeAccount.type === 'organization') {
      const activeOrg = organizations[activeAccount.id];
      if (!activeOrg) return [];
      
      // Org owners can see everything in their org
      if (activeOrg.ownerId === user.id) {
        return accountWorkspaces;
      }
      
      const userTeamIds = new Set(
        (activeOrg.teams || [])
          .filter(team => (team.memberIds || []).includes(user.id))
          .map(team => team.id)
      );

      return accountWorkspaces.filter(workspace => {
        // Check for explicit access (direct grant or team grant)
        const hasDirectGrant = (workspace.grants || []).some(g => g.userId === user.id && g.status === 'active');
        const hasTeamGrant = (workspace.teamIds || []).some(teamId => userTeamIds.has(teamId));
        const hasExplicitAccess = hasDirectGrant || hasTeamGrant;
        
        // If workspace is 'visible', all org members can see it.
        if (workspace.visibility === 'visible') {
          return true;
        }

        // If workspace is 'hidden', only users with explicit access can see it.
        if (workspace.visibility === 'hidden') {
          return hasExplicitAccess;
        }

        return false;
      });
    }

    return [];
  }, [workspaces, activeAccount, organizations, user]);

  return visibleWorkspaces;
}
