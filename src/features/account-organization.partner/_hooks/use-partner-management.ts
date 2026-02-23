"use client";

import { useCallback } from 'react';
import { useApp } from '@/features/workspace-core';
import {
  createPartnerGroup as createPartnerGroupAction,
  sendPartnerInvite as sendPartnerInviteAction,
  dismissPartnerMember as dismissPartnerMemberAction,
} from '../_actions';
import type { MemberReference } from '@/shared/types';

export function usePartnerManagement() {
  const { state: appState } = useApp();
  const { activeAccount } = appState;

  const orgId = activeAccount?.accountType === 'organization' ? activeAccount.id : null

  const createPartnerGroup = useCallback(async (groupName: string) => {
    if (!orgId) throw new Error('No active organization selected');
    return createPartnerGroupAction(orgId, groupName);
  }, [orgId]);

  const sendPartnerInvite = useCallback(async (teamId: string, email: string) => {
    if (!orgId) throw new Error('No active organization selected');
    return sendPartnerInviteAction(orgId, teamId, email);
  }, [orgId]);

  const dismissPartnerMember = useCallback(async (teamId: string, member: MemberReference) => {
    if (!orgId) throw new Error('No active organization selected');
    return dismissPartnerMemberAction(orgId, teamId, member);
  }, [orgId]);

  return { createPartnerGroup, sendPartnerInvite, dismissPartnerMember };
}
