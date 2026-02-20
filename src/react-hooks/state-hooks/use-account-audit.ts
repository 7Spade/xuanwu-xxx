// [職責] Projection — Account 層跨 Workspace 稽核事件流狀態邏輯
/**
 * @fileoverview useAccountAudit - Hook for account-wide audit log state.
 * @description Converts the `auditLogs` record from AccountContext into a
 * sorted array and manages selection state. Also provides the org-context guard.
 *
 * @responsibility
 * - Read `auditLogs` record from AccountContext.
 * - Memoize conversion to array.
 * - Manage `selectedLog` detail-sheet state.
 * - Expose `isOrgContext` guard so the component stays dumb.
 */
"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/react-hooks/state-hooks/use-app";
import { useAccount } from "@/react-hooks/state-hooks/use-account";
import { AuditLog } from "@/domain-types/domain";

export function useAccountAudit() {
  const { state: appState } = useApp();
  const { state: accountState } = useAccount();
  const { activeAccount } = appState;
  const { auditLogs } = accountState;

  const logs = useMemo(() => Object.values(auditLogs) as AuditLog[], [auditLogs]);
  const isOrgContext = activeAccount?.accountType === "organization";

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  return {
    logs,
    isOrgContext,
    selectedLog,
    setSelectedLog,
    clearSelection: () => setSelectedLog(null),
  };
}
