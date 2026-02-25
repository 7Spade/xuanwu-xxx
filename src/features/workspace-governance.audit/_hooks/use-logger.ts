
"use client";

import { useFirebase } from "@/shared/app-providers/firebase-provider";
import { serverTimestamp, type FieldValue } from "firebase/firestore";
import { addDocument } from "@/shared/infra/firestore/firestore.write.adapter";
import { useCallback } from "react";
import type { AuditLog, Account } from "@/shared/types";
import { useApp } from "@/shared/app-providers/app-context";

/**
 * useLogger - Zero-cognition logging interface.
 * Automatically handles the physical separation of Daily and Audit logs.
 * REFACTORED: Now uses the official write adapter instead of direct SDK calls,
 * respecting architectural boundaries.
 */
export function useLogger(workspaceId?: string, workspaceName?: string) {
  const { db } = useFirebase();
  const { state: appState } = useApp();
  const { activeAccount } = appState;

  const logDaily = useCallback(async (content: string, photoURLs: string[] | undefined, user: Account) => {
    if (!activeAccount || activeAccount.accountType !== 'organization' || !user || !db) return;

    const dailyData = {
      content,
      author: {
        uid: user.id,
        name: user.name,
        avatarUrl: '', // You might want to get this from user profile
      },
      recordedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      accountId: activeAccount.id,
      workspaceId: workspaceId || "",
      workspaceName: workspaceName || "Dimension Level",
      photoURLs: photoURLs || [],
    };

    return addDocument(`accounts/${activeAccount.id}/dailyLogs`, dailyData);
  }, [db, activeAccount, workspaceId, workspaceName]);

  const logAudit = useCallback(async (action: string, target: string, type: AuditLog['type']) => {
    if (!activeAccount || activeAccount.accountType !== 'organization' || !db) return;

    const eventData: Omit<AuditLog, 'id'| 'recordedAt'> & { recordedAt: FieldValue } = {
      actor: activeAccount.name,
      action,
      target,
      type,
      recordedAt: serverTimestamp(),
      accountId: activeAccount.id,
      workspaceId: workspaceId || undefined
    };

    return addDocument(`accounts/${activeAccount.id}/auditLogs`, eventData);
  }, [db, activeAccount, workspaceId]);

  return { logDaily, logAudit };
}
