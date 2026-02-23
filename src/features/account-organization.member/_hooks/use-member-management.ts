"use client";

import { useCallback } from 'react';
import { useApp } from '@/features/workspace-core';
import {
  recruitMember as recruitMemberAction,
  dismissMember as dismissMemberAction,
} from '../_actions';
import type { MemberReference } from '@/shared/types';

export function useMemberManagement() {
  const { state: appState } = useApp();
  const { activeAccount } = appState;

  const orgId = activeAccount?.accountType === 'organization' ? activeAccount.id : null

  const recruitMember = useCallback(async (newId: string, name: string, email: string) => {
    if (!orgId) throw new Error('No active organization selected');
    return recruitMemberAction(orgId, newId, name, email);
  }, [orgId]);

  const dismissMember = useCallback(async (member: MemberReference) => {
    if (!orgId) throw new Error('No active organization selected');
    return dismissMemberAction(orgId, member);
  }, [orgId]);

  return { recruitMember, dismissMember };
}
