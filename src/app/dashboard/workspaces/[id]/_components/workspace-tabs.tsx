// [職責] 能力 (Capabilities) 導覽與渲染邏輯
"use client";

import { useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { useWorkspace } from "@/context/workspace-context";
import {
  WorkspaceFiles,
  WorkspaceTasks,
  WorkspaceIssues,
  WorkspaceDaily,
  WorkspaceMembers,
  WorkspaceQA,
  WorkspaceAcceptance,
  WorkspaceCapabilities,
  WorkspaceFinance,
  WorkspaceAudit,
  WorkspaceSchedule,
  WorkspaceDocumentParser,
} from "../capabilities";

// =================================================================
// == Capability Registry — maps capability IDs to components and labels
// =================================================================
const CAPABILITY_REGISTRY = {
  // Core
  capabilities: { component: <WorkspaceCapabilities />, label: "Capabilities" },
  // Governance
  members: { component: <WorkspaceMembers />, label: "Members" },
  // Business (mountable)
  tasks: { component: <WorkspaceTasks />, label: "Tasks" },
  qa: { component: <WorkspaceQA />, label: "QA" },
  acceptance: { component: <WorkspaceAcceptance />, label: "Acceptance" },
  finance: { component: <WorkspaceFinance />, label: "Finance" },
  issues: { component: <WorkspaceIssues />, label: "Issues" },
  files: { component: <WorkspaceFiles />, label: "Files" },
  daily: { component: <WorkspaceDaily />, label: "Daily" },
  schedule: { component: <WorkspaceSchedule />, label: "Schedule" },
  "document-parser": { component: <WorkspaceDocumentParser />, label: "Document Parser" },
  // Projection
  audit: { component: <WorkspaceAudit />, label: "Audit" },
};

// =================================================================
// == Layer Boundaries — permanent tabs that are never dynamically mounted
// =================================================================

// Layer 1 — Core: Workspace lifecycle & capability management
const CORE_CAPABILITY = { id: "capabilities", name: "Capabilities" };

// Layer 2 — Governance: Access control, roles & permissions
const GOVERNANCE_CAPABILITY_IDS = new Set(["members"]);
const GOVERNANCE_CAPABILITIES = [{ id: "members", name: "Members" }];

// Layer 4 — Projection: Read models & event stream (always visible, never mountable)
const PROJECTION_CAPABILITY_IDS = new Set(["audit"]);
const PROJECTION_CAPABILITIES = [{ id: "audit", name: "Audit" }];

// All non-Business IDs (used to filter the dynamic Business capability list)
const PERMANENT_CAPABILITY_IDS = new Set([
  ...Array.from(GOVERNANCE_CAPABILITY_IDS),
  ...Array.from(PROJECTION_CAPABILITY_IDS),
  CORE_CAPABILITY.id,
]);

export function WorkspaceTabs() {
  const { workspace } = useWorkspace();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('capability') || 'capabilities';

  const mountedCapabilities = useMemo(() => {
    // Layer 3 — Business: dynamic capabilities mounted per workspace, excluding permanent layers.
    const businessCapabilities = (workspace.capabilities || [])
      .filter((capability) => !PERMANENT_CAPABILITY_IDS.has(capability.id))
      .map((capability) => ({
        id: capability.id,
        name: capability.name,
      }));

    // Tab order: Core → Governance → Business → Projection
    return [CORE_CAPABILITY, ...GOVERNANCE_CAPABILITIES, ...businessCapabilities, ...PROJECTION_CAPABILITIES];
  }, [workspace.capabilities]);

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl w-full flex overflow-x-auto justify-start no-scrollbar">
        {mountedCapabilities.map((cap) => {
          const detail = CAPABILITY_REGISTRY[cap.id as keyof typeof CAPABILITY_REGISTRY];
          return detail ? (
            <TabsTrigger
              key={cap.id}
              value={cap.id}
              className="text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg"
            >
              {detail.label}
            </TabsTrigger>
          ) : null;
        })}
      </TabsList>

      {mountedCapabilities.map((cap) => {
        const detail = CAPABILITY_REGISTRY[cap.id as keyof typeof CAPABILITY_REGISTRY];
        return detail ? (
          <TabsContent key={cap.id} value={cap.id}>
            {detail.component}
          </TabsContent>
        ) : null;
      })}
    </Tabs>
  );
}
