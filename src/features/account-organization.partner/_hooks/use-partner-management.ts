"use client";

import { useCallback } from 'react';
import { useApp } from '@/shared/app-providers/app-context';
import {
  createPartnerGroup as createPartnerGroupAction,
  sendPartnerInvite as sendPartnerInviteAction,
  dismissPartnerMember as dismissPartnerMemberAction,
} from '../_actions';
import type { MemberReference } from '@/shared/types';

export function usePartnerManagement() {
  const { state: appState } = useApp();
  const { activeAccount } = appState;

  const organizationId = activeAccount?.accountType === 'organization' ? activeAccount.id : null

  const createPartnerGroup = useCallback(async (groupName: string) => {
    if (!organizationId) throw new Error('No active organization selected');
    return createPartnerGroupAction(organizationId, groupName);
  }, [organizationId]);

  const sendPartnerInvite = useCallback(async (teamId: string, email: string) => {
    if (!organizationId) throw new Error('No active organization selected');
    return sendPartnerInviteAction(organizationId, teamId, email);
  }, [organizationId]);

  const dismissPartnerMember = useCallback(async (teamId: string, member: MemberReference) => {
    if (!organizationId) throw new Error('No active organization selected');
    return dismissPartnerMemberAction(organizationId, teamId, member);
  }, [organizationId]);

  return { createPartnerGroup, sendPartnerInvite, dismissPartnerMember };
}
