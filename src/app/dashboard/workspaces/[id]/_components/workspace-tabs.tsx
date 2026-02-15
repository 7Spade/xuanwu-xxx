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

const CAPABILITY_DETAILS = {
  capabilities: { component: <WorkspaceCapabilities />, label: "Capabilities" },
  audit: { component: <WorkspaceAudit />, label: "Audit" },
  members: { component: <WorkspaceMembers />, label: "Members" },
  files: { component: <WorkspaceFiles />, label: "Files" },
  tasks: { component: <WorkspaceTasks />, label: "Tasks" },
  qa: { component: <WorkspaceQA />, label: "QA" },
  acceptance: { component: <WorkspaceAcceptance />, label: "Acceptance" },
  finance: { component: <WorkspaceFinance />, label: "Finance" },
  issues: { component: <WorkspaceIssues />, label: "Issues" },
  daily: { component: <WorkspaceDaily />, label: "Daily" },
  schedule: { component: <WorkspaceSchedule />, label: "Schedule" },
  "document-parser": { component: <WorkspaceDocumentParser />, label: "Document Parser" },
};

const CORE_CAPABILITY = { id: "capabilities", name: "Capabilities" };

export function WorkspaceTabs() {
  const { workspace } = useWorkspace();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('capability') || 'capabilities';

  const mountedCapabilities = useMemo(() => {
    const dynamicCapabilities = (workspace.capabilities || []).map(
      (capability) => ({
        id: capability.id,
        name: capability.name,
      })
    );

    return [CORE_CAPABILITY, ...dynamicCapabilities];
  }, [workspace.capabilities]);

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl w-full flex overflow-x-auto justify-start no-scrollbar">
        {mountedCapabilities.map((cap) => {
          const detail = CAPABILITY_DETAILS[cap.id as keyof typeof CAPABILITY_DETAILS];
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
        const detail = CAPABILITY_DETAILS[cap.id as keyof typeof CAPABILITY_DETAILS];
        return detail ? (
          <TabsContent key={cap.id} value={cap.id}>
            {detail.component}
          </TabsContent>
        ) : null;
      })}
    </Tabs>
  );
}
