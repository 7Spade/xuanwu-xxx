
// [職責] 為特定工作區的所有頁面提供共享的 Context 和 UI 佈局。
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/button";
import { ArrowLeft, Settings, Trash2, ChevronRight, MapPin } from "lucide-react";
import { useState, ReactNode, use } from "react";
import { WorkspaceProvider, useWorkspace } from "@/context/workspace-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/_components/ui/dialog";
import { WorkspaceSettingsDialog } from "./_components/workspace-settings";
import { WorkspaceStatusBar } from "./_components/workspace-status-bar";
import { handleDeleteWorkspace } from "../_lib/workspace-actions";
import type { WorkspaceLifecycleState, Address } from "@/types/domain";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

/**
 * WorkspaceLayoutInner - The actual UI layout component.
 * It consumes the context provided by WorkspaceLayout.
 */
function WorkspaceLayoutInner({ children }: { children: React.ReactNode }) {
  const { workspace, updateWorkspaceSettings } = useWorkspace();
  const router = useRouter();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onUpdateSettings = async (settings: { name: string; visibility: 'visible' | 'hidden'; lifecycleState: WorkspaceLifecycleState; address?: Address }) => {
    setLoading(true);
    await updateWorkspaceSettings(settings);
    setIsSettingsOpen(false);
    setLoading(false);
  };

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
            onClick={() => setIsSettingsOpen(true)}
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

      {children}

      <WorkspaceSettingsDialog
        workspace={workspace}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onSave={onUpdateSettings}
        loading={loading}
      />

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
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const resolvedParams = use(params);
  return (
    <WorkspaceProvider workspaceId={resolvedParams.id}>
      <WorkspaceLayoutInner>{children}</WorkspaceLayoutInner>
    </WorkspaceProvider>
  );
}

