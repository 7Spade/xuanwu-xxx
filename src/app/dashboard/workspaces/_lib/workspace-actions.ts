// [職責] 封裝所有的 Mutation (Create, Delete 呼叫)
"use client";

import { toast } from "@/shared/hooks/use-toast";
import {
  createWorkspace,
  updateWorkspaceSettings,
  deleteWorkspace,
} from "@/server-commands/workspace";
import type { Account, WorkspaceLifecycleState } from "@/types/domain";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const handleCreateWorkspace = async (
  name: string,
  activeAccount: Account | null,
  onSuccess: () => void,
  t: (key: string) => string
) => {
  if (!name.trim() || !activeAccount) {
    toast({
      variant: "destructive",
      title: t("workspaces.creationFailed"),
      description: t("workspaces.accountNotFound"),
    });
    return;
  }

  try {
    await createWorkspace(name, activeAccount);
    toast({
      title: t("workspaces.logicalSpaceCreated"),
      description: t("workspaces.spaceSynchronized").replace("{name}", name),
    });
    onSuccess();
  } catch (error: unknown) {
    console.error("Error creating workspace:", error);
    toast({
      variant: "destructive",
      title: t("workspaces.failedToCreateSpace"),
      description: getErrorMessage(error, t("common.unknownError")),
    });
  }
};

export const handleUpdateWorkspaceSettings = async (
  workspaceId: string,
  settings: { name: string; visibility: 'visible' | 'hidden', lifecycleState: WorkspaceLifecycleState },
  onSuccess: () => void
) => {
  try {
    await updateWorkspaceSettings(workspaceId, settings);
    toast({ title: "Space settings synchronized" });
    onSuccess();
  } catch(error) {
    console.error("Error updating settings:", error);
    toast({
      variant: "destructive",
      title: "Failed to Update Settings",
      description: getErrorMessage(error, "An unknown error occurred."),
    });
  }
};

export const handleDeleteWorkspace = async (
  workspaceId: string,
  onSuccess: () => void
) => {
  try {
    await deleteWorkspace(workspaceId);
    toast({ title: "Workspace node destroyed" });
    onSuccess();
  } catch(error) {
    console.error("Error deleting workspace:", error);
    toast({
      variant: "destructive",
      title: "Failed to Destroy Space",
      description: getErrorMessage(error, "An unknown error occurred."),
    });
  }
};
