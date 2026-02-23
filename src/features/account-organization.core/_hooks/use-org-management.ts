"use client";

import { useCallback } from 'react';
import { useApp } from '@/features/workspace-core';
import { useAuth } from '@/shared/app-providers/auth-provider';
import {
  createOrganization as createOrganizationAction,
  updateOrganizationSettings as updateOrganizationSettingsAction,
  deleteOrganization as deleteOrganizationAction,
} from '../_actions';
import type { ThemeConfig } from '@/shared/types';

export function useOrgManagement() {
  const { state: appState } = useApp();
  const { activeAccount } = appState;
  const { state: authState } = useAuth();
  const { user } = authState;

  const orgId = activeAccount?.accountType === 'organization' ? activeAccount.id : null

  const createOrganization = useCallback(async (orgName: string) => {
    if (!user) throw new Error("User must be authenticated to create an organization.");
    return createOrganizationAction(orgName, user);
  }, [user]);

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
    updateOrganizationSettings,
    deleteOrganization,
  };
}
