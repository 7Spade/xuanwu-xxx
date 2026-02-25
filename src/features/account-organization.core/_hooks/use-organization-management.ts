"use client";

import { useCallback } from 'react';
import { useApp } from '@/shared/app-providers/app-context';
import { useAuth } from '@/shared/app-providers/auth-provider';
import {
  createOrganization as createOrganizationAction,
  updateOrganizationSettings as updateOrganizationSettingsAction,
  deleteOrganization as deleteOrganizationAction,
} from '../_actions';
import type { ThemeConfig } from '@/shared/types';

export function useOrganizationManagement() {
  const { state: appState } = useApp();
  const { activeAccount } = appState;
  const { state: authState } = useAuth();
  const { user } = authState;

  const organizationId = activeAccount?.accountType === 'organization' ? activeAccount.id : null

  const createOrganization = useCallback(async (organizationName: string) => {
    if (!user) throw new Error("User must be authenticated to create an organization.");
    return createOrganizationAction(organizationName, user);
  }, [user]);

  const updateOrganizationSettings = useCallback(async (settings: { name?: string; description?: string; theme?: ThemeConfig | null; }) => {
    if (!organizationId) throw new Error('No active organization selected');
    return updateOrganizationSettingsAction(organizationId, settings);
  }, [organizationId]);

  const deleteOrganization = useCallback(async () => {
    if (!organizationId) throw new Error('No active organization selected');
    return deleteOrganizationAction(organizationId);
  }, [organizationId]);

  return {
    createOrganization,
    updateOrganizationSettings,
    deleteOrganization,
  };
}
