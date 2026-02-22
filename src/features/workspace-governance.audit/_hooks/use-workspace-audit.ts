// [職責] Projection — 單一 Workspace 稽核事件流狀態邏輯
/**
 * @fileoverview useWorkspaceAudit - Hook for workspace-scoped audit log state.
 * @description Encapsulates selection state for the workspace audit tab.
 * Data arrives fully prepared from WorkspaceContext — no transformation needed.
 *
 * @responsibility
 * - Read `localAuditLogs` from WorkspaceContext.
 * - Manage `selectedLog` detail-sheet state.
 */
"use client";

import { useState } from "react";
import { useWorkspace } from "@/features/workspace-core";
import { type AuditLog } from "@/shared/types";

export function useWorkspaceAudit() {
  const { localAuditLogs } = useWorkspace();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  return {
    localAuditLogs,
    selectedLog,
    setSelectedLog,
    clearSelection: () => setSelectedLog(null),
  };
}
