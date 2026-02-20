
// [職責] 為特定工作區的所有頁面提供共享的 Context 和 UI 佈局。
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/shadcn-ui/button";
import { ArrowLeft, Settings, Trash2, ChevronRight, MapPin } from "lucide-react";
import { useState, use } from "react";
import { WorkspaceProvider, useWorkspace } from "@/react-providers/workspace-provider"
import { useWorkspaceEventHandler } from "./_event-handlers/workspace-event-handler"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/shadcn-ui/dialog";
import { WorkspaceStatusBar } from "@/view-modules/workspaces/workspace-status-bar";
import { WorkspaceNavTabs } from "@/view-modules/workspaces/workspace-nav-tabs";
import { handleDeleteWorkspace } from "@/use-cases/workspace/workspace-actions";
import { PageHeader } from "@/shared/shadcn-ui/page-header";

/**
 * WorkspaceLayoutInner - The actual UI layout component.
 * It consumes the context provided by WorkspaceLayout.
 */
function WorkspaceLayoutInner({ workspaceId, pluginTab, modal, panel }: { workspaceId: string; pluginTab: React.ReactNode; modal: React.ReactNode; panel: React.ReactNode }) {
  useWorkspaceEventHandler()
  const { workspace } = useWorkspace()
  const router = useRouter();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDeleteWorkspace = async () => {
    setLoading(true);
    await handleDeleteWorkspace(workspace.id, () => {
      setIsDeleteOpen(false);
      router.push("/dashboard/workspaces");
    });
    setLoading(false);
  };
  
  const formattedAddress = workspace.address ? [workspace.address.street, workspace.address.city, workspace.address.state, workspace.address.country, workspace.address.postalCode].filter(Boolean).join(', ') : 'No address defined.';

  return (
     <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 gpu-accelerated">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span>Dimension Space</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground">{workspace.name}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/20 hover:bg-destructive/5 font-bold uppercase text-[10px] tracking-widest"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" /> Destroy Space
        </Button>
      </div>

      <PageHeader
        title={workspace.name}
        description="Manage this space's atomic capability stack, data exchange, and governance protocols."
      >
        <div className="mb-2">
            <WorkspaceStatusBar />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 font-bold uppercase text-[10px] tracking-widest"
            onClick={() => router.push(`/dashboard/workspaces/${workspaceId}/settings`)}
          >
            <Settings className="w-3.5 h-3.5" /> Space Settings
          </Button>
        </div>
      </PageHeader>
      
      {workspace.address && (
          <div className="p-4 bg-muted/40 rounded-2xl border flex items-center gap-4 -mt-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">{formattedAddress}</p>
          </div>
      )}

      <WorkspaceNavTabs workspaceId={workspaceId} />
      {pluginTab}
      {panel}
      {modal}

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive font-headline text-xl">
              Initiate Workspace Destruction Protocol
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 p-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-[11px] text-destructive italic">
            This action will permanently erase the workspace node "
            {workspace.name}" and all its subordinate atomic data and technical
            specifications.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteWorkspace} disabled={loading}>
              {loading ? 'Destroying...' : 'Confirm Destruction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


/**
 * WorkspaceLayout - The main layout component.
 * Its sole responsibility is to provide the WorkspaceContext.
 */
export default function WorkspaceLayout({
  "plugin-tab": pluginTab,
  modal,
  panel,
  params,
}: {
  "plugin-tab": React.ReactNode;
  modal: React.ReactNode;
  panel: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <WorkspaceProvider workspaceId={resolvedParams.id}>
      <WorkspaceLayoutInner workspaceId={resolvedParams.id} pluginTab={pluginTab} modal={modal} panel={panel} />
    </WorkspaceProvider>
  );
}

