"use client";

import { useCallback } from 'react';
import { useApp } from '@/shared/app-providers/app-context';
import {
  createTeam as createTeamAction,
  updateTeamMembers as updateTeamMembersAction,
} from '../_actions';

export function useTeamManagement() {
  const { state: appState } = useApp();
  const { activeAccount } = appState;

  const organizationId = activeAccount?.accountType === 'organization' ? activeAccount.id : null

  const createTeam = useCallback(async (teamName: string, type: 'internal' | 'external') => {
    if (!organizationId) throw new Error('No active organization selected');
    return createTeamAction(organizationId, teamName, type);
  }, [organizationId]);

  const updateTeamMembers = useCallback(async (teamId: string, memberId: string, action: 'add' | 'remove') => {
    if (!organizationId) throw new Error('No active organization selected');
    return updateTeamMembersAction(organizationId, teamId, memberId, action);
  }, [organizationId]);

  return { createTeam, updateTeamMembers };
}
