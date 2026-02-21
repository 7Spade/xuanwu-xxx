"use client";

import { useCallback } from 'react';
import { useApp } from '@/react-hooks/state-hooks/use-app';
import { useAuth } from '@/shared/app-providers/auth-provider';
import {
  createOrganization as createOrganizationAction,
  recruitMember as recruitMemberAction,
  dismissMember as dismissMemberAction,
  createTeam as createTeamAction,
  updateTeamMembers as updateTeamMembersAction,
  sendPartnerInvite as sendPartnerInviteAction,
  dismissPartnerMember as dismissPartnerMemberAction,
  updateOrganizationSettings as updateOrganizationSettingsAction,
  deleteOrganization as deleteOrganizationAction,
} from '../_actions';
import type { MemberReference, Account, ThemeConfig } from '@/shared/types';

/**
 * @fileoverview A hook for managing account-level (organization) write operations.
 * This hook acts as an intermediary between UI components and the infrastructure
 * layer (facades), ensuring components do not directly call infrastructure logic.
 */
export function useAccountManagement() {
  const { state: appState } = useApp();
  const { activeAccount } = appState;
  const { state: authState } = useAuth();
  const { user } = authState;

  const orgId = activeAccount?.accountType === 'organization' ? activeAccount.id : null

  const createOrganization = useCallback(async (orgName: string) => {
    if (!user) throw new Error("User must be authenticated to create an organization.");
    return createOrganizationAction(orgName, user);
  }, [user]);

  const recruitMember = useCallback(async (newId: string, name: string, email: string) => {
      if (!orgId) throw new Error('No active organization selected');
      return recruitMemberAction(orgId, newId, name, email);
    }, [orgId]);

  const dismissMember = useCallback(async (member: MemberReference) => {
      if (!orgId) throw new Error('No active organization selected');
      return dismissMemberAction(orgId, member);
    }, [orgId]);

  const createTeam = useCallback(async (teamName: string, type: 'internal' | 'external') => {
      if (!orgId) throw new Error('No active organization selected');
      return createTeamAction(orgId, teamName, type);
    }, [orgId]);

  const updateTeamMembers = useCallback(async (teamId: string, memberId: string, action: 'add' | 'remove') => {
      if (!orgId) throw new Error('No active organization selected');
      return updateTeamMembersAction(orgId, teamId, memberId, action);
    }, [orgId]);
  
  const sendPartnerInvite = useCallback(async (teamId: string, email: string) => {
      if (!orgId) throw new Error('No active organization selected');
      return sendPartnerInviteAction(orgId, teamId, email);
    }, [orgId]);

  const dismissPartnerMember = useCallback(async (teamId: string, member: MemberReference) => {
      if (!orgId) throw new Error('No active organization selected');
      return dismissPartnerMemberAction(orgId, teamId, member);
    }, [orgId]);
    
  const updateOrganizationSettings = useCallback(async (settings: { name?: string; description?: string; theme?: ThemeConfig | null; }) => {
      if (!orgId) throw new Error('No active organization selected');
      return updateOrganizationSettingsAction(orgId, settings);
    }, [orgId]);
    
  const deleteOrganization = useCallback(async () => {
      if (!orgId) throw new Error('No active organization selected');
      return deleteOrganizationAction(orgId);
    }, [orgId]);

  return {
    createOrganization,
    recruitMember,
    dismissMember,
    createTeam,
    updateTeamMembers,
    sendPartnerInvite,
    dismissPartnerMember,
    updateOrganizationSettings,
    deleteOrganization,
  };
}
