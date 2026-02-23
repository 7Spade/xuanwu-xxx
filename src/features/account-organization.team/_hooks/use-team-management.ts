"use client";

import { useCallback } from 'react';
import { useApp } from '@/features/workspace-core';
import {
  createTeam as createTeamAction,
  updateTeamMembers as updateTeamMembersAction,
} from '../_actions';

export function useTeamManagement() {
  const { state: appState } = useApp();
  const { activeAccount } = appState;

  const orgId = activeAccount?.accountType === 'organization' ? activeAccount.id : null

  const createTeam = useCallback(async (teamName: string, type: 'internal' | 'external') => {
    if (!orgId) throw new Error('No active organization selected');
    return createTeamAction(orgId, teamName, type);
  }, [orgId]);

  const updateTeamMembers = useCallback(async (teamId: string, memberId: string, action: 'add' | 'remove') => {
    if (!orgId) throw new Error('No active organization selected');
    return updateTeamMembersAction(orgId, teamId, memberId, action);
  }, [orgId]);

  return { createTeam, updateTeamMembers };
}
