"use client";

import { useCallback } from 'react';
import { useApp } from './use-app';
import { useAuth } from '@/context/auth-context';
import {
  createOrganization as createOrganizationFacade,
  recruitOrganizationMember,
  dismissOrganizationMember,
  createTeam as createTeamFacade,
  updateTeamMembers as updateTeamMembersFacade,
  sendPartnerInvite as sendPartnerInviteFacade,
  dismissPartnerMember as dismissPartnerMemberFacade,
  updateOrganizationSettings as updateOrganizationSettingsFacade,
  deleteOrganization as deleteOrganizationFacade,
} from '@/infra/firebase/firestore/firestore.facade';
import type { MemberReference, User, ThemeConfig } from '@/types/domain';

/**
 * @fileoverview A hook for managing organization-level actions.
 * This hook acts as an intermediary between the UI components and the
 * infrastructure layer (facades), ensuring that components do not
* directly call infrastructure logic. It centralizes all organization-related
 * write operations.
 */
export function useOrganization() {
  const { state: appState } = useApp();
  const { activeAccount } = appState;
  const { state: authState } = useAuth();
  const { user } = authState;

  const orgId = activeAccount?.type === 'organization' ? activeAccount.id : null;

  const createOrganization = useCallback(async (orgName: string) => {
    if (!user) throw new Error("User must be authenticated to create an organization.");
    return createOrganizationFacade(orgName, user);
  }, [user]);

  const recruitMember = useCallback(async (newId: string, name: string, email: string) => {
      if (!orgId) throw new Error('No active organization selected');
      return recruitOrganizationMember(orgId, newId, name, email);
    }, [orgId]);

  const dismissMember = useCallback(async (member: MemberReference) => {
      if (!orgId) throw new Error('No active organization selected');
      return dismissOrganizationMember(orgId, member);
    }, [orgId]);

  const createTeam = useCallback(async (teamName: string, type: 'internal' | 'external') => {
      if (!orgId) throw new Error('No active organization selected');
      return createTeamFacade(orgId, teamName, type);
    }, [orgId]);

  const updateTeamMembers = useCallback(async (teamId: string, memberId: string, action: 'add' | 'remove') => {
      if (!orgId) throw new Error('No active organization selected');
      return updateTeamMembersFacade(orgId, teamId, memberId, action);
    }, [orgId]);
  
  const sendPartnerInvite = useCallback(async (teamId: string, email: string) => {
      if (!orgId) throw new Error('No active organization selected');
      return sendPartnerInviteFacade(orgId, teamId, email);
    }, [orgId]);

  const dismissPartnerMember = useCallback(async (teamId: string, member: MemberReference) => {
      if (!orgId) throw new Error('No active organization selected');
      return dismissPartnerMemberFacade(orgId, teamId, member);
    }, [orgId]);
    
  const updateOrganizationSettings = useCallback(async (settings: { name?: string; description?: string; theme?: ThemeConfig | null; }) => {
      if (!orgId) throw new Error('No active organization selected');
      return updateOrganizationSettingsFacade(orgId, settings);
    }, [orgId]);
    
  const deleteOrganization = useCallback(async () => {
      if (!orgId) throw new Error('No active organization selected');
      return deleteOrganizationFacade(orgId);
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
