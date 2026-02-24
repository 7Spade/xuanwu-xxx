
// [職責] 為特定工作區的所有頁面提供共享的 Context 和 UI 佈局。
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/shadcn-ui/button";
import { ArrowLeft, Settings, Trash2, ChevronRight, MapPin } from "lucide-react";
import { useState, use } from "react";
import { WorkspaceProvider, useWorkspace , useWorkspaceEventHandler , WorkspaceStatusBar , WorkspaceNavTabs , useWorkspaceCommands } from "@/features/workspace-core"
import { ROUTES } from "@/shared/constants/routes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/shadcn-ui/dialog";
import { PageHeader } from "@/shared/ui/page-header";

/**
 * WorkspaceLayoutInner - The actual UI layout component.
 * It consumes the context provided by WorkspaceLayout.
 */
function WorkspaceLayoutInner({ workspaceId, businesstab, modal, panel }: { workspaceId: string; businesstab: React.ReactNode; modal: React.ReactNode; panel: React.ReactNode }) {
  useWorkspaceEventHandler()
  const { workspace } = useWorkspace()
  const router = useRouter();
  const { handleDeleteWorkspace } = useWorkspaceCommands();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDeleteWorkspace = async () => {
    setLoading(true);
    await handleDeleteWorkspace(workspace.id, () => {
      setIsDeleteOpen(false);
      router.push(ROUTES.WORKSPACES);
    });
    setLoading(false);
  };
  
  const formattedAddress = workspace.address ? [workspace.address.street, workspace.address.city, workspace.address.state, workspace.address.country, workspace.address.postalCode].filter(Boolean).join(', ') : 'No address defined.';

  return (
     <div className="gpu-accelerated mx-auto max-w-7xl space-y-6 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="size-8 hover:bg-primary/5"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span>Dimension Space</span>
            <ChevronRight className="size-3 opacity-30" />
            <span className="text-foreground">{workspace.name}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/20 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/5"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="mr-2 size-3.5" /> Destroy Space
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
            className="h-9 gap-2 text-[10px] font-bold uppercase tracking-widest"
            onClick={() => router.push(`/workspaces/${workspaceId}/settings`)}
          >
            <Settings className="size-3.5" /> Space Settings
          </Button>
        </div>
      </PageHeader>
      
      {workspace.address && (
          <div className="-mt-2 flex items-center gap-4 rounded-2xl border bg-muted/40 p-4">
              <MapPin className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">{formattedAddress}</p>
          </div>
      )}

      <WorkspaceNavTabs workspaceId={workspaceId} />
      {businesstab}
      {panel}
      {modal}

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl text-destructive">
              Initiate Workspace Destruction Protocol
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-[11px] italic text-destructive">
            This action will permanently erase the workspace node &quot;
            {workspace.name}&quot; and all its subordinate atomic data and technical
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
  businesstab: businesstab,
  modal,
  panel,
  params,
}: {
  businesstab: React.ReactNode;
  modal: React.ReactNode;
  panel: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <WorkspaceProvider workspaceId={resolvedParams.id}>
      <WorkspaceLayoutInner workspaceId={resolvedParams.id} businesstab={businesstab} modal={modal} panel={panel} />
    </WorkspaceProvider>
  );
}

